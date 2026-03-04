import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { UserRole, SubscriptionStatus } from "@/generated/prisma/client"
import Link from "next/link"
import { signOut } from "@/lib/auth"
import {
  ShieldCheck,
  Star,
  Search,
  Briefcase,
  Building2,
  ExternalLink,
  User,
  AlertCircle,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "@/components/ui/copy-button"
import { Separator } from "@/components/ui/separator"

// ---------------------------------------------------------------------------
// Shared layout shell
// ---------------------------------------------------------------------------

function DashboardShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: UserRole }
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </Badge>
            <span className="hidden text-sm text-zinc-500 sm:block">
              {user.name ?? user.email}
            </span>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CANDIDATE dashboard
// ---------------------------------------------------------------------------

async function CandidateDashboard({ userId }: { userId: string }) {
  const reviews = await prisma.review.findMany({
    where: { candidateId: userId },
    include: { recruiter: { select: { slug: true, user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Your reviews</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Reviews you&apos;ve written about recruiters you&apos;ve worked with.
        </p>
      </div>

      {/* CTA */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Search className="h-8 w-8 text-zinc-300" />
          <div>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">Find a recruiter to review</p>
            <p className="mt-1 text-sm text-zinc-500">
              Search by name or use an invite link your recruiter shared.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link href="/search">Browse recruiters</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Past reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Your reviews ({reviews.length})
          </h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <Link
                      href={`/r/${review.recruiter.slug}`}
                      className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                    >
                      {review.recruiter.user.name ?? review.recruiter.slug}
                    </Link>
                    <div className="mt-1 flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < Math.round(review.overallRating) ? "fill-current" : "fill-zinc-200 dark:fill-zinc-700"}`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-zinc-500">{review.overallRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// RECRUITER dashboard
// ---------------------------------------------------------------------------

async function SubscriptionBanner({
  subscriptionStatus,
  trialEndsAt,
}: {
  subscriptionStatus: SubscriptionStatus
  trialEndsAt: Date | null
}) {
  if (subscriptionStatus === "ACTIVE") return null

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
    : 0
  const trialExpired = !trialEndsAt || trialEndsAt < new Date()

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
      <div className="flex items-center gap-3">
        <Zap className="h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-sm text-amber-900 dark:text-amber-100">
          {trialExpired
            ? "Your free trial has ended. Subscribe to keep your profile active and visible."
            : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left on your free trial.`}
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white">
        <Link href="/subscribe">Subscribe — CHF 9.90/mo</Link>
      </Button>
    </div>
  )
}

async function RecruiterDashboard({
  userId,
  subscriptionStatus,
  trialEndsAt,
}: {
  userId: string
  subscriptionStatus: SubscriptionStatus
  trialEndsAt: Date | null
}) {
  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId },
    include: {
      reviews: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { candidate: { select: { name: true } } },
      },
    },
  })

  if (!profile) {
    redirect("/r/onboarding")
  }

  const stats = [
    { label: "Overall rating", value: profile.reviewCount > 0 ? profile.totalRatingAvg.toFixed(1) : "—" },
    { label: "Total reviews", value: String(profile.reviewCount) },
    { label: "Candidate exp.", value: profile.reviewCount > 0 ? profile.ratingCandidateExperienceAvg.toFixed(1) : "—" },
    { label: "Transparency", value: profile.reviewCount > 0 ? profile.ratingTransparencyAvg.toFixed(1) : "—" },
  ]

  return (
    <div className="space-y-8">
      <SubscriptionBanner subscriptionStatus={subscriptionStatus} trialEndsAt={trialEndsAt} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Recruiter dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Public profile:{" "}
            <Link href={`/r/${profile.slug}`} className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300">
              /r/{profile.slug}
            </Link>
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/edit">Edit profile</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/r/${profile.slug}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              View public profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-zinc-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invite code */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Your invite code</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <code className="rounded bg-zinc-100 px-3 py-1.5 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {profile.inviteCode}
            </code>
            <p className="mt-1.5 text-xs text-zinc-400">
              Share this in your email signature or LinkedIn so candidates can find your profile.
            </p>
          </div>
          <CopyButton text={profile.inviteCode} />
        </CardContent>
      </Card>

      {/* No reviews yet */}
      {profile.reviewCount === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Star className="h-8 w-8 text-zinc-300" />
            <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">No reviews yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Share your invite code with candidates to start collecting verified reviews.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent reviews */}
      {profile.reviews.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Recent reviews
          </h2>
          <div className="space-y-3">
            {profile.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {review.candidate.name ?? "Anonymous"}
                      </span>
                      <Badge
                        variant="secondary"
                        className="gap-1 text-[10px]"
                      >
                        {review.authProviderBadge}
                      </Badge>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < Math.round(review.overallRating) ? "fill-current" : "fill-zinc-200 dark:fill-zinc-700"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-zinc-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// COMPANY dashboard
// ---------------------------------------------------------------------------

async function CompanyDashboard({
  userId,
  subscriptionStatus,
  trialEndsAt,
}: {
  userId: string
  subscriptionStatus: SubscriptionStatus
  trialEndsAt: Date | null
}) {
  const profile = await prisma.companyProfile.findUnique({
    where: { userId },
    include: {
      recruiters: {
        include: { user: { select: { name: true } } },
        orderBy: { totalRatingAvg: "desc" },
      },
    },
  })

  if (!profile) {
    redirect("/c/onboarding")
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/join/${profile.inviteLink}`

  return (
    <div className="space-y-8">
      <SubscriptionBanner subscriptionStatus={subscriptionStatus} trialEndsAt={trialEndsAt} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{profile.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Company profile:{" "}
            <Link href={`/c/${profile.slug}`} className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300">
              /c/{profile.slug}
            </Link>
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5 self-start">
          <Link href={`/c/${profile.slug}`} target="_blank">
            <ExternalLink className="h-3.5 w-3.5" />
            View public page
          </Link>
        </Button>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Avg. company rating", value: profile.reviewCount > 0 ? profile.aggregatedRatingAvg.toFixed(1) : "—" },
          { label: "Total reviews", value: String(profile.reviewCount) },
          { label: "Connected recruiters", value: String(profile.recruiters.length) },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-zinc-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recruiter invite link */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recruiter invite link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {inviteUrl}
            </code>
            <CopyButton text={inviteUrl} />
          </div>
          <p className="text-xs text-zinc-400">
            Share this link with recruiters on your team so they can connect their profiles to your company.
          </p>
        </CardContent>
      </Card>

      {/* Recruiters list */}
      {profile.recruiters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle className="h-8 w-8 text-zinc-300" />
            <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">No recruiters connected yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Share the invite link above with your recruiting team.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Your recruiters
          </h2>
          <div className="space-y-3">
            {profile.recruiters.map((recruiter) => (
              <Card key={recruiter.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <Briefcase className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <Link
                        href={`/r/${recruiter.slug}`}
                        className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                      >
                        {recruiter.user.name ?? recruiter.slug}
                      </Link>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.round(recruiter.totalRatingAvg) ? "fill-current" : "fill-zinc-200 dark:fill-zinc-700"}`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-zinc-400">
                          {recruiter.reviewCount} review{recruiter.reviewCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {recruiter.totalRatingAvg > 0 ? recruiter.totalRatingAvg.toFixed(1) : "—"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page — role router
// ---------------------------------------------------------------------------

export const metadata = {
  title: "Dashboard — Open-Recruiter",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, subscriptionStatus: true, trialEndsAt: true },
  })

  return (
    <DashboardShell user={user}>
      {user.role === "RECRUITER" && (
        <RecruiterDashboard
          userId={user.id}
          subscriptionStatus={user.subscriptionStatus}
          trialEndsAt={user.trialEndsAt}
        />
      )}
      {user.role === "COMPANY" && (
        <CompanyDashboard
          userId={user.id}
          subscriptionStatus={user.subscriptionStatus}
          trialEndsAt={user.trialEndsAt}
        />
      )}
      {(user.role === "CANDIDATE" || user.role === "ADMIN") && (
        <CandidateDashboard userId={user.id} />
      )}
    </DashboardShell>
  )
}
