"use client"

import { useState, useTransition } from "react"
import { Star, AlertCircle, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface ReviewFormProps {
  /** Bound server action — receives the full FormData */
  action: (formData: FormData) => Promise<void>
  recruiterName: string
}

// ---------------------------------------------------------------------------
// Inline star row — click to rate, hover to preview
// ---------------------------------------------------------------------------

function RatingRow({
  name,
  label,
  hint,
  value,
  onChange,
}: {
  name: string
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"]

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        {display > 0 && (
          <span className="text-xs text-zinc-400">{labels[display]}</span>
        )}
      </div>
      <p className="text-xs text-zinc-400">{hint}</p>
      <div className="flex gap-1 pt-0.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= display
                  ? "fill-amber-400 text-amber-400"
                  : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
              }`}
            />
          </button>
        ))}
      </div>
      {/* Carries value to the FormData received by the server action */}
      <input type="hidden" name={name} value={value} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function ReviewForm({ action, recruiterName }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition()
  const [ratings, setRatings] = useState({
    ratingCandidateExperience: 0,
    ratingSpeed: 0,
    ratingTransparency: 0,
    ratingKnowledge: 0,
  })
  const [error, setError] = useState<string | null>(null)

  const values = Object.values(ratings)
  const allRated = values.every((v) => v > 0)
  const minRating = allRated ? Math.min(...values) : 5
  const commentRequired = allRated && minRating <= 3
  const evidenceRequired = allRated && minRating === 1

  function set(field: keyof typeof ratings) {
    return (v: number) => setRatings((prev) => ({ ...prev, [field]: v }))
  }

  function handleSubmit(formData: FormData) {
    setError(null)

    if (!allRated) {
      setError("Please rate all four dimensions before submitting.")
      return
    }
    if (commentRequired && !String(formData.get("comment") ?? "").trim()) {
      setError("A comment is required for ratings of 3 stars or below.")
      return
    }
    if (evidenceRequired) {
      const file = formData.get("evidence") as File | null
      if (!file || file.size === 0) {
        setError("Evidence is required for 1-star reviews to prevent false reports.")
        return
      }
    }

    startTransition(() => action(formData).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    }))
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Rating dimensions */}
      <div className="space-y-5">
        <RatingRow
          name="ratingCandidateExperience"
          label="Candidate experience"
          hint="Did they treat you respectfully? Was the process professional?"
          value={ratings.ratingCandidateExperience}
          onChange={set("ratingCandidateExperience")}
        />
        <RatingRow
          name="ratingSpeed"
          label="Speed"
          hint="How quickly did they respond and move the process forward?"
          value={ratings.ratingSpeed}
          onChange={set("ratingSpeed")}
        />
        <RatingRow
          name="ratingTransparency"
          label="Transparency"
          hint="Were they honest about the role, salary, and next steps?"
          value={ratings.ratingTransparency}
          onChange={set("ratingTransparency")}
        />
        <RatingRow
          name="ratingKnowledge"
          label="Knowledge"
          hint="Did they understand the role and your industry?"
          value={ratings.ratingKnowledge}
          onChange={set("ratingKnowledge")}
        />
      </div>

      {/* Dynamic requirements banner */}
      {allRated && minRating <= 3 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {minRating === 1
            ? "1-star reviews require a comment and evidence (screenshot or PDF) to prevent false reports."
            : "Ratings of 3 stars or below require a comment to help the recruiter understand your experience."}
        </div>
      )}

      {/* Comment */}
      <div className="space-y-1.5">
        <Label htmlFor="comment">
          Comment{" "}
          {commentRequired ? (
            <Badge variant="destructive" className="ml-1 text-[10px]">Required</Badge>
          ) : (
            <span className="text-xs font-normal text-zinc-400">(optional for 4–5 stars)</span>
          )}
        </Label>
        <Textarea
          id="comment"
          name="comment"
          placeholder={`Share your experience working with ${recruiterName.split(" ")[0]}…`}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Evidence upload — only shown for 1★ */}
      {evidenceRequired && (
        <div className="space-y-1.5">
          <Label htmlFor="evidence">
            Evidence{" "}
            <Badge variant="destructive" className="ml-1 text-[10px]">Required for 1★</Badge>
          </Label>
          <Input
            id="evidence"
            name="evidence"
            type="file"
            accept="image/*,.pdf"
            className="file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-xs file:font-medium dark:file:bg-zinc-800"
          />
          <p className="flex items-center gap-1 text-xs text-zinc-400">
            <Upload className="h-3 w-3" />
            Screenshot or PDF — max 5 MB. Only used to verify your report.
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending || !allRated}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </Button>

      <p className="text-center text-xs text-zinc-400">
        Your review is tied to your verified account and cannot be anonymous.
        Reviews may be moderated if flagged.
      </p>
    </form>
  )
}
