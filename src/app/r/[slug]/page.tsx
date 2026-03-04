import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
  ShieldCheck,
  Star,
  Building2,
  ExternalLink,
  User,
  CheckCircle2,
  Flag,
} from "lucide-react"
import { flagReview } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "fill-current" : "fill-zinc-200 dark:fill-zinc-700"}`}
        />
      ))}
      <span className="ml-1.5 text-sm text-zinc-500">{rating.toFixed(1)}</span>
    </div>
  )
}

const BADGE_LABELS: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  GOOGLE: "Google",
  APPLE: "Apple",
  EMAIL: "Email",
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profile = await prisma.recruiterProfile.findUnique({
    where: { slug },
    include: { user: { select: { name: true } } },
  })
  if (!profile) return {}
  return {
    title: `${profile.user.name ?? slug} — Open-Recruiter`,
    description: `Verified recruiter ratings for ${profile.user.name ?? slug}. ${profile.reviewCount} reviews.`,
  }
}

export default async function RecruiterProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ reviewed?: string }>
}) {
  const { slug } = await params
  const { reviewed } = await searchParams
  const session = await auth()

  const profile = await prisma.recruiterProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, image: true } },
      company: { select: { name: true, slug: true } },
      reviews: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: { candidate: { select: { name: true } } },
      },
    },
  })

  if (!profile || !profile.isPublic) notFound()

  const isOwnProfile =
    session?.user && (session.user as { id?: string }).id === profile.userId

  const ratingDimensions = [
    { label: "Candidate experience", value: profile.ratingCandidateExperienceAvg },
    { label: "Speed", value: profile.ratingSpeedAvg },
    { label: "Transparency", value: profile.ratingTransparencyAvg },
    { label: "Knowledge", value: profile.ratingKnowledgeAvg },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Simple nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
          <div className="flex gap-2">
            {isOwnProfile ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard">My dashboard</Link>
              </Button>
            ) : session?.user ? (
              <Button asChild size="sm">
                <Link href={`/review/${profile.slug}`}>Write a review</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href={`/sign-in?callbackUrl=/review/${profile.slug}`}>
                  Sign in to review
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        {/* Success banner after submitting a review */}
        {reviewed === "1" && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Your review has been submitted. Thank you for helping the community!
          </div>
        )}
        {/* Profile header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
            {profile.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.user.image}
                alt={profile.user.name ?? ""}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-zinc-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {profile.user.name ?? slug}
              </h1>
              {profile.company && (
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  <Link href={`/c/${profile.company.slug}`} className="hover:underline">
                    {profile.company.name}
                  </Link>
                </Badge>
              )}
            </div>

            {/* Rating summary */}
            {profile.reviewCount > 0 ? (
              <div className="mt-2">
                <StarRow rating={profile.totalRatingAvg} />
                <p className="mt-0.5 text-sm text-zinc-500">
                  {profile.reviewCount} verified review{profile.reviewCount !== 1 ? "s" : ""}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">No reviews yet</p>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {profile.bio}
              </p>
            )}

            {/* LinkedIn link */}
            {profile.linkedInUrl && (
              <a
                href={profile.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                LinkedIn profile
              </a>
            )}
          </div>

          {/* Write a review CTA (larger screens) */}
          {!isOwnProfile && (
            <Button asChild className="hidden sm:flex">
              <Link href={session?.user ? `/review/${profile.slug}` : `/sign-in?callbackUrl=/review/${profile.slug}`}>
                Write a review
              </Link>
            </Button>
          )}
        </div>

        <Separator />

        {/* Rating breakdown */}
        {profile.reviewCount > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Rating breakdown
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ratingDimensions.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
                  <StarRow rating={value} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Reviews {profile.reviewCount > 0 && `(${profile.reviewCount})`}
          </h2>

          {profile.reviews.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <Star className="h-8 w-8 text-zinc-300" />
                <div>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">
                    No reviews yet
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Be the first to rate {profile.user.name?.split(" ")[0] ?? "this recruiter"}.
                  </p>
                </div>
                {!isOwnProfile && (
                  <Button asChild size="sm" className="mt-1">
                    <Link href={session?.user ? `/review/${profile.slug}` : `/sign-in?callbackUrl=/review/${profile.slug}`}>
                      Write a review
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {profile.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <User className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {review.candidate.name ?? "Anonymous"}
                          </p>
                          <Badge variant="secondary" className="mt-0.5 gap-1 text-[10px]">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            {BADGE_LABELS[review.authProviderBadge] ?? review.authProviderBadge}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <StarRow rating={review.overallRating} />
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {review.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {review.comment}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                        <span>Exp. {review.ratingCandidateExperience}/5</span>
                        <span>Speed {review.ratingSpeed}/5</span>
                        <span>Transparency {review.ratingTransparency}/5</span>
                        <span>Knowledge {review.ratingKnowledge}/5</span>
                      </div>
                      {/* Flag button — shown to authenticated non-owners */}
                      {session?.user && !isOwnProfile && (
                        <form action={flagReview}>
                          <input type="hidden" name="reviewId" value={review.id} />
                          <button
                            type="submit"
                            className="flex items-center gap-1 text-[11px] text-zinc-300 transition-colors hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400"
                            title="Report this review"
                          >
                            <Flag className="h-3 w-3" />
                            Report
                          </button>
                        </form>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
