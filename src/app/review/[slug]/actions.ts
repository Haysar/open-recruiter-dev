"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadEvidence } from "@/lib/storage"
import { moderateReviewContent } from "@/lib/ai-moderation"
import { redirect } from "next/navigation"
import type { AuthBadge } from "@/generated/prisma/client"

// ---------------------------------------------------------------------------
// Map OAuth provider string → AuthBadge enum
// ---------------------------------------------------------------------------

const PROVIDER_TO_BADGE: Record<string, AuthBadge> = {
  linkedin: "LINKEDIN",
  google: "GOOGLE",
  apple: "APPLE",
  nodemailer: "EMAIL",
  email: "EMAIL",
}

// ---------------------------------------------------------------------------
// Incremental average helper: (oldAvg * oldCount + newValue) / (oldCount + 1)
// ---------------------------------------------------------------------------

function incrementalAvg(oldAvg: number, oldCount: number, newValue: number): number {
  if (oldCount === 0) return newValue
  return (oldAvg * oldCount + newValue) / (oldCount + 1)
}

// ---------------------------------------------------------------------------
// submitReview — called from /review/[slug]/page.tsx via .bind()
// ---------------------------------------------------------------------------

export async function submitReview(slug: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/review/${slug}`)
  }

  const candidateId = session.user.id

  // Load the recruiter profile
  const profile = await prisma.recruiterProfile.findUnique({
    where: { slug },
    select: { id: true, totalRatingAvg: true, ratingCandidateExperienceAvg: true, ratingSpeedAvg: true, ratingTransparencyAvg: true, ratingKnowledgeAvg: true, reviewCount: true },
  })
  if (!profile) {
    throw new Error("Recruiter profile not found.")
  }

  // 6-month cooldown check
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const recent = await prisma.review.findFirst({
    where: {
      candidateId,
      recruiterId: profile.id,
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true },
  })
  if (recent) {
    const nextAllowed = new Date(recent.createdAt)
    nextAllowed.setMonth(nextAllowed.getMonth() + 6)
    throw new Error(
      `You already reviewed this recruiter recently. You can leave another review after ${nextAllowed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
    )
  }

  // Parse and validate rating values
  function parseRating(name: string): number {
    const v = parseInt(String(formData.get(name) ?? "0"), 10)
    if (v < 1 || v > 5) throw new Error(`Invalid rating for ${name}.`)
    return v
  }

  const ratingCandidateExperience = parseRating("ratingCandidateExperience")
  const ratingSpeed = parseRating("ratingSpeed")
  const ratingTransparency = parseRating("ratingTransparency")
  const ratingKnowledge = parseRating("ratingKnowledge")
  const overallRating = (ratingCandidateExperience + ratingSpeed + ratingTransparency + ratingKnowledge) / 4

  const comment = String(formData.get("comment") ?? "").trim() || null

  // Validate comment requirement (server-side, don't trust client)
  const minRating = Math.min(ratingCandidateExperience, ratingSpeed, ratingTransparency, ratingKnowledge)
  if (minRating <= 3 && !comment) {
    throw new Error("A comment is required for ratings of 3 stars or below.")
  }
  if (minRating === 1 && !comment) {
    throw new Error("A comment and evidence are required for 1-star reviews.")
  }

  // Determine the auth badge from the candidate's most recent OAuth account
  const account = await prisma.account.findFirst({
    where: { userId: candidateId },
    orderBy: { createdAt: "desc" } as never,
    select: { provider: true },
  })
  const authProviderBadge: AuthBadge = PROVIDER_TO_BADGE[account?.provider ?? ""] ?? "EMAIL"

  // Evidence upload — S3-compatible storage (only when storage is configured)
  let evidenceUrl: string | null = null
  const evidenceFile = formData.get("evidence") as File | null
  if (evidenceFile && evidenceFile.size > 0) {
    if (!process.env.STORAGE_BUCKET_URL) {
      // Storage not yet configured — accept submission but log warning
      console.warn("[review] STORAGE_BUCKET_URL not set; evidence file not stored for review candidate:", candidateId)
    } else {
      evidenceUrl = await uploadEvidence(evidenceFile, candidateId)
    }
  }

  // AI moderation — run before creating the review to determine initial status
  // Falls back to PUBLISHED if AI is not configured or call fails.
  const recruiterName = (await prisma.recruiterProfile.findUnique({
    where: { id: profile.id },
    select: { user: { select: { name: true } } },
  }))?.user.name ?? slug

  let initialStatus: "PUBLISHED" | "UNDER_REVIEW" = "PUBLISHED"
  if (comment) {
    const moderation = await moderateReviewContent({ comment, overallRating, recruiterName })
    if (moderation.flagged) {
      initialStatus = "UNDER_REVIEW"
    }
  }

  // Atomic transaction: create Review + update denormalized averages on RecruiterProfile
  // Only count the review in averages if it will be PUBLISHED immediately.
  const { reviewCount, totalRatingAvg, ratingCandidateExperienceAvg, ratingSpeedAvg, ratingTransparencyAvg, ratingKnowledgeAvg } = profile
  const countingReview = initialStatus === "PUBLISHED"

  await prisma.$transaction([
    prisma.review.create({
      data: {
        candidateId,
        recruiterId: profile.id,
        ratingCandidateExperience,
        ratingSpeed,
        ratingTransparency,
        ratingKnowledge,
        overallRating,
        comment,
        evidenceUrl,
        authProviderBadge,
        status: initialStatus,
      },
    }),
    // Only update averages for reviews that go live immediately
    ...(countingReview ? [
      prisma.recruiterProfile.update({
        where: { id: profile.id },
        data: {
          reviewCount: reviewCount + 1,
          totalRatingAvg: incrementalAvg(totalRatingAvg, reviewCount, overallRating),
          ratingCandidateExperienceAvg: incrementalAvg(ratingCandidateExperienceAvg, reviewCount, ratingCandidateExperience),
          ratingSpeedAvg: incrementalAvg(ratingSpeedAvg, reviewCount, ratingSpeed),
          ratingTransparencyAvg: incrementalAvg(ratingTransparencyAvg, reviewCount, ratingTransparency),
          ratingKnowledgeAvg: incrementalAvg(ratingKnowledgeAvg, reviewCount, ratingKnowledge),
        },
      }),
    ] : []),
  ])

  redirect(`/r/${slug}?reviewed=1`)
}
