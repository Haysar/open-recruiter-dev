import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ShieldCheck, Search, Star, Building2, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Find a recruiter — Open-Recruiter",
  description: "Search verified recruiter ratings by name or company.",
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function searchRecruiters(query: string) {
  const q = query.trim()

  if (!q) {
    // No query — return top-rated recruiters
    return prisma.recruiterProfile.findMany({
      where: { isPublic: true },
      orderBy: [{ totalRatingAvg: "desc" }, { reviewCount: "desc" }],
      take: 24,
      include: {
        user: { select: { name: true, image: true } },
        company: { select: { name: true, slug: true } },
      },
    })
  }

  // Search by recruiter name or company name using `contains` (works without full-text index).
  // Once the DB has the @@fulltext([bio]) index populated, `mode: "insensitive"` can be used
  // or Prisma full-text search can replace this.
  return prisma.recruiterProfile.findMany({
    where: {
      isPublic: true,
      OR: [
        { user: { name: { contains: q } } },
        { company: { name: { contains: q } } },
        { bio: { contains: q } },
      ],
    },
    orderBy: [{ totalRatingAvg: "desc" }, { reviewCount: "desc" }],
    take: 24,
    include: {
      user: { select: { name: true, image: true } },
      company: { select: { name: true, slug: true } },
    },
  })
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function RecruiterCard({
  profile,
}: {
  profile: Awaited<ReturnType<typeof searchRecruiters>>[number]
}) {
  const name = profile.user.name ?? profile.slug

  return (
    <Link href={`/r/${profile.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              {profile.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.user.image}
                  alt={name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-zinc-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{name}</p>
              {profile.company && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Building2 className="h-3 w-3" />
                  {profile.company.name}
                </div>
              )}
            </div>
          </div>

          {/* Rating */}
          {profile.reviewCount > 0 ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(profile.totalRatingAvg) ? "fill-current" : "fill-zinc-200 dark:fill-zinc-700"}`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {profile.totalRatingAvg.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {profile.reviewCount} verified review{profile.reviewCount !== 1 ? "s" : ""}
              </p>
            </div>
          ) : (
            <Badge variant="secondary" className="w-fit text-[10px]">No reviews yet</Badge>
          )}

          {/* Bio snippet */}
          {profile.bio && (
            <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{profile.bio}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = "" } = await searchParams
  const recruiters = await searchRecruiters(q)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Search bar */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Find a recruiter</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Search by name, company, or specialisation to see verified candidate ratings.
          </p>
          <form method="GET" action="/search" className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search recruiter name or company…"
                className="pl-9"
                autoFocus={!q}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Results header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {q
              ? `${recruiters.length} result${recruiters.length !== 1 ? "s" : ""} for "${q}"`
              : `Top ${recruiters.length} recruiter${recruiters.length !== 1 ? "s" : ""}`}
          </p>
          {q && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/search">Clear</Link>
            </Button>
          )}
        </div>

        {/* Results grid */}
        {recruiters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
            <Search className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
            <p className="font-medium text-zinc-600 dark:text-zinc-400">No recruiters found</p>
            <p className="mt-1 text-sm text-zinc-400">
              Try a different name or company, or{" "}
              <Link href="/search" className="underline">
                browse all
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recruiters.map((r) => (
              <RecruiterCard key={r.id} profile={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
