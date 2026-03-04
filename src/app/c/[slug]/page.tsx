import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
  ShieldCheck,
  Star,
  Building2,
  ExternalLink,
  Briefcase,
  User,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const company = await prisma.companyProfile.findUnique({ where: { slug } })
  if (!company) return {}
  return {
    title: `${company.name} — Open-Recruiter`,
    description: `Recruiter ratings for ${company.name}. ${company.reviewCount} total reviews.`,
  }
}

export default async function CompanyProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ joined?: string }>
}) {
  const { slug } = await params
  const { joined } = await searchParams
  const session = await auth()

  const company = await prisma.companyProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { id: true } },
      recruiters: {
        where: { isPublic: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: [{ totalRatingAvg: "desc" }, { reviewCount: "desc" }],
      },
    },
  })

  if (!company) notFound()

  const isOwner = session?.user && (session.user as { id?: string }).id === company.user.id

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
          <div className="flex gap-2">
            {isOwner && (
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard">My dashboard</Link>
              </Button>
            )}
            <Button asChild size="sm" variant="ghost">
              <Link href="/search">← All recruiters</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        {/* Success banner after joining via invite */}
        {joined === "1" && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            You&apos;ve successfully joined this company. Your profile is now listed here.
          </div>
        )}
        {/* Company header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* Logo placeholder */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <Building2 className="h-8 w-8 text-zinc-400" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{company.name}</h1>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}

            {company.reviewCount > 0 ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(company.aggregatedRatingAvg) ? "fill-current" : "fill-zinc-200 dark:fill-zinc-700"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-zinc-500">
                  {company.aggregatedRatingAvg.toFixed(1)} avg · {company.reviewCount} review{company.reviewCount !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">No reviews yet</p>
            )}
          </div>

          {/* Stats badges */}
          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            <Badge variant="secondary" className="gap-1.5">
              <Briefcase className="h-3 w-3" />
              {company.recruiters.length} recruiter{company.recruiters.length !== 1 ? "s" : ""}
            </Badge>
            {company.reviewCount > 0 && (
              <Badge variant="secondary" className="gap-1.5">
                <Star className="h-3 w-3" />
                {company.reviewCount} verified review{company.reviewCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Recruiter list */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Recruiters at {company.name}
          </h2>

          {company.recruiters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
              <Briefcase className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
              <p className="font-medium text-zinc-500">No recruiters connected yet</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {company.recruiters.map((recruiter) => {
                const name = recruiter.user.name ?? recruiter.slug
                return (
                  <Link key={recruiter.id} href={`/r/${recruiter.slug}`}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        {/* Avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                          {recruiter.user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={recruiter.user.image}
                              alt={name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                            {name}
                          </p>
                          {recruiter.reviewCount > 0 ? (
                            <div className="flex items-center gap-1 text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i < Math.round(recruiter.totalRatingAvg) ? "fill-current" : "fill-zinc-200 dark:fill-zinc-700"}`}
                                />
                              ))}
                              <span className="ml-1 text-xs text-zinc-500">
                                {recruiter.totalRatingAvg.toFixed(1)} · {recruiter.reviewCount} review{recruiter.reviewCount !== 1 ? "s" : ""}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400">No reviews yet</p>
                          )}
                        </div>

                        <ExternalLink className="h-4 w-4 shrink-0 text-zinc-300" />
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
