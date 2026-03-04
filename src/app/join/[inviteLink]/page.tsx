import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { acceptCompanyInvite } from "./actions"
import { ShieldCheck, Building2, Briefcase, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Join company — Open-Recruiter",
}

export default async function JoinCompanyPage({
  params,
}: {
  params: Promise<{ inviteLink: string }>
}) {
  const { inviteLink } = await params
  const session = await auth()

  // Not signed in → redirect with return URL
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/join/${inviteLink}`)
  }

  const userId = session.user.id

  // Load the company
  const company = await prisma.companyProfile.findUnique({
    where: { inviteLink },
    select: { id: true, name: true, slug: true, website: true },
  })
  if (!company) notFound()

  // Load user + recruiter profile
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true },
  })
  const recruiterProfile = user.role === "RECRUITER"
    ? await prisma.recruiterProfile.findUnique({
        where: { userId },
        select: { id: true, companyId: true },
      })
    : null

  // Already connected to this company?
  const alreadyConnected = recruiterProfile?.companyId === company.id

  if (alreadyConnected) {
    redirect(`/c/${company.slug}`)
  }

  // Bind action to this specific invite link
  const boundAction = acceptCompanyInvite.bind(null, inviteLink)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-6 w-6" />
            Open-Recruiter
          </Link>
          <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <Building2 className="h-7 w-7 text-zinc-400" />
          </div>
          <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Join {company.name}
          </h1>
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            You&apos;ve been invited to connect your recruiter profile to{" "}
            <strong className="text-zinc-700 dark:text-zinc-300">{company.name}</strong>.
          </p>
        </div>

        {/* Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">What happens when you join?</CardTitle>
            <CardDescription>
              Your profile will appear on the {company.name} company page.
              Your existing reviews stay with you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error states */}
            {user.role !== "RECRUITER" && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                Only recruiter accounts can join companies. Your account is registered as{" "}
                <Badge variant="secondary" className="ml-0.5">
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </Badge>
                .
              </div>
            )}

            {user.role === "RECRUITER" && !recruiterProfile && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                You need to complete your recruiter profile before joining a company.
              </div>
            )}

            {recruiterProfile?.companyId && recruiterProfile.companyId !== company.id && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                You are already connected to a different company. Accepting this invite will switch your
                company association.
              </div>
            )}

            {/* Action buttons */}
            {user.role === "RECRUITER" && recruiterProfile ? (
              <div className="flex flex-col gap-2">
                <form action={boundAction}>
                  <Button type="submit" className="w-full gap-2">
                    <Briefcase className="h-4 w-4" />
                    {recruiterProfile.companyId
                      ? `Switch to ${company.name}`
                      : `Join ${company.name}`}
                  </Button>
                </form>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            ) : user.role === "RECRUITER" && !recruiterProfile ? (
              <Button asChild className="w-full">
                <Link href="/r/onboarding">Complete your recruiter profile first</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Company link */}
        <p className="text-center text-xs text-zinc-400">
          Want to see the company profile first?{" "}
          <Link href={`/c/${company.slug}`} className="underline underline-offset-2 hover:text-zinc-600">
            View {company.name}
          </Link>
        </p>
      </div>
    </div>
  )
}
