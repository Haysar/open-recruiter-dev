import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { submitReview } from "./actions"
import { ReviewForm } from "@/components/review/review-form"
import { ShieldCheck, Star, User, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profile = await prisma.recruiterProfile.findUnique({
    where: { slug },
    include: { user: { select: { name: true } } },
  })
  if (!profile) return {}
  return {
    title: `Review ${profile.user.name ?? slug} — Open-Recruiter`,
  }
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()

  // Must be signed in
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/review/${slug}`)
  }

  const candidateId = session.user.id

  // Load recruiter profile
  const profile = await prisma.recruiterProfile.findUnique({
    where: { slug },
    include: { user: { select: { name: true, image: true } } },
  })
  if (!profile || !profile.isPublic) notFound()

  // A recruiter cannot review themselves
  if (profile.userId === candidateId) {
    redirect(`/r/${slug}`)
  }

  // 6-month cooldown check
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const recentReview = await prisma.review.findFirst({
    where: {
      candidateId,
      recruiterId: profile.id,
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true },
  })

  const recruiterName = profile.user.name ?? slug

  // Already reviewed — show cooldown message
  if (recentReview) {
    const nextAllowed = new Date(recentReview.createdAt)
    nextAllowed.setMonth(nextAllowed.getMonth() + 6)
    return (
      <ReviewShell slug={slug} recruiterName={recruiterName}>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                You already reviewed {recruiterName.split(" ")[0]}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                You can leave another review after{" "}
                <strong>
                  {nextAllowed.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
                .
              </p>
            </div>
            <Button asChild variant="outline" className="mt-2">
              <Link href={`/r/${slug}`}>View {recruiterName.split(" ")[0]}&apos;s profile</Link>
            </Button>
          </CardContent>
        </Card>
      </ReviewShell>
    )
  }

  // Bind the server action to the slug so the form doesn't need to pass it
  const boundAction = submitReview.bind(null, slug)

  return (
    <ReviewShell slug={slug} recruiterName={recruiterName}>
      {/* Recruiter context card */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            {profile.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.user.image}
                alt={recruiterName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-zinc-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">{recruiterName}</p>
            <div className="mt-0.5 flex items-center gap-2">
              {profile.reviewCount > 0 ? (
                <>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < Math.round(profile.totalRatingAvg) ? "fill-current" : "fill-zinc-200 dark:fill-zinc-700"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {profile.totalRatingAvg.toFixed(1)} · {profile.reviewCount} review{profile.reviewCount !== 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <Badge variant="secondary" className="text-[10px]">No reviews yet</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Form card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Your review</CardTitle>
          <CardDescription>
            Rate {recruiterName.split(" ")[0]} on four dimensions. Your identity is verified
            and your review will be public.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewForm action={boundAction} recruiterName={recruiterName} />
        </CardContent>
      </Card>
    </ReviewShell>
  )
}

// ---------------------------------------------------------------------------
// Shared layout shell for this page
// ---------------------------------------------------------------------------

function ReviewShell({
  slug,
  recruiterName,
  children,
}: {
  slug: string
  recruiterName: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/r/${slug}`}>← Back to profile</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Review {recruiterName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your honest feedback helps other candidates make informed decisions.
          </p>
        </div>
        {children}
      </main>
    </div>
  )
}
