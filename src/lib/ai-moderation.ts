/**
 * AI-powered review moderation.
 *
 * Reads the configured provider and decrypted API key from AdminSettings,
 * sends the review text for moderation, and returns whether the review
 * should be flagged for human review.
 *
 * Currently supports: Mistral, Gemini, Claude (Anthropic), OpenAI.
 *
 * If no AdminSettings / API key is configured, moderation is skipped
 * and the review is published directly.
 */

import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"

interface ModerationInput {
  comment: string
  overallRating: number
  recruiterName: string
}

interface ModerationResult {
  flagged: boolean
  reason?: string
}

const SYSTEM_PROMPT = `You are a content moderator for Open-Recruiter, a platform where job candidates rate recruiters.
Your task is to determine if a review violates the platform rules.

Flag the review if it contains:
- Hate speech, slurs, or targeted harassment
- Personal information (phone numbers, home addresses)
- Completely fabricated or spam content with no relation to a recruiting experience
- Content that is clearly off-topic (e.g. advertising, nonsense text)

Do NOT flag reviews for:
- Negative but honest feedback about a recruiting experience
- Strong criticism of a recruiter's professional conduct
- Emotional language about a frustrating experience

Respond with JSON only: {"flagged": true/false, "reason": "short reason if flagged or null"}`

// ---------------------------------------------------------------------------
// Provider implementations
// ---------------------------------------------------------------------------

async function moderateWithMistral(apiKey: string, text: string): Promise<ModerationResult> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    }),
  })
  if (!res.ok) throw new Error(`Mistral API error ${res.status}`)
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return JSON.parse(data.choices[0].message.content) as ModerationResult
}

async function moderateWithGemini(apiKey: string, text: string): Promise<ModerationResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nReview to moderate:\n${text}` }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    }),
  })
  if (!res.ok) throw new Error(`Gemini API error ${res.status}`)
  const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] }
  return JSON.parse(data.candidates[0].content.parts[0].text) as ModerationResult
}

async function moderateWithClaude(apiKey: string, text: string): Promise<ModerationResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    }),
  })
  if (!res.ok) throw new Error(`Claude API error ${res.status}`)
  const data = await res.json() as { content: { type: string; text: string }[] }
  const textContent = data.content.find((c) => c.type === "text")?.text ?? "{}"
  return JSON.parse(textContent) as ModerationResult
}

async function moderateWithOpenAI(apiKey: string, text: string): Promise<ModerationResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}`)
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return JSON.parse(data.choices[0].message.content) as ModerationResult
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function moderateReviewContent(input: ModerationInput): Promise<ModerationResult> {
  // Load admin settings — if not configured, skip moderation
  const settings = await prisma.adminSettings.findFirst({
    select: { aiProvider: true, aiApiKeyEncrypted: true },
  })

  if (!settings?.aiApiKeyEncrypted) {
    return { flagged: false }
  }

  const apiKey = decrypt(settings.aiApiKeyEncrypted)
  const text = `Recruiter name: ${input.recruiterName}
Overall rating: ${input.overallRating}/5
Review comment: ${input.comment}`

  try {
    switch (settings.aiProvider) {
      case "MISTRAL": return await moderateWithMistral(apiKey, text)
      case "GEMINI":  return await moderateWithGemini(apiKey, text)
      case "CLAUDE":  return await moderateWithClaude(apiKey, text)
      case "OPENAI":  return await moderateWithOpenAI(apiKey, text)
      default:        return { flagged: false }
    }
  } catch (err) {
    // Never block a review submission due to an AI error — just log and skip
    console.error("[ai-moderation] Error calling AI provider:", err)
    return { flagged: false }
  }
}
