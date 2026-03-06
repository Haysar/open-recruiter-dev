import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { startSubscription } from "./actions"
import { ShieldCheck, CheckCircle2, Star, Briefcase, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Subscribe — Open-Recruiter",
}

const PLAN_FEATURES = {
  RECRUITER: [
    "Public profile with verified star ratings",
    "Shareable invite code for email & LinkedIn",
    "Full review analytics dashboard",
    "Connect to a company profile",
    "Priority support",
  ],
  COMPANY: [
    "Company profile with aggregate ratings",
    "Recruiter invite links",
    "Dashboard across all connected recruiters",
    "Priority support",
  ],
}

export default async function SubscribePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/subscribe")

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { role: true, subscriptionStatus: true, trialEndsAt: true },
  })

  // Already active — bounce to dashboard
  if (user.subscriptionStatus === "ACTIVE") redirect("/dashboard?already_subscribed=1")

  const isRecruiter = user.role === "RECRUITER"
  const isCompany = user.role === "COMPANY"

  if (!isRecruiter && !isCompany) {
    // Candidates don't need subscriptions
    redirect("/dashboard")
  }

  const features = isRecruiter ? PLAN_FEATURES.RECRUITER : PLAN_FEATURES.COMPANY
  const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null
  const trialExpired = trialEndsAt ? trialEndsAt < new Date() : true
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2">

          {/* Plan details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3 gap-1.5">
                {isRecruiter ? <Briefcase className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                {isRecruiter ? "Recruiter plan" : "Company plan"}
              </Badge>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Activate your account
              </h1>
              <p className="mt-2 text-zinc-500">
                {trialExpired
                  ? "Your free trial has ended. Subscribe to keep your profile active and visible."
                  : `Your free trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Subscribe now to ensure uninterrupted access.`}
              </p>
            </div>

            {/* Trial status */}
            {!trialExpired && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining on your free trial
              </div>
            )}

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">CHF 9.90</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">Cancel anytime. No contracts.</p>
            </div>

            <Separator />

            {/* Features */}
            <ul className="space-y-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secured by Payrexx
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                Swiss-hosted data
              </span>
            </div>
          </div>

          {/* Checkout card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complete your subscription</CardTitle>
              <CardDescription>
                You&apos;ll be redirected to our secure payment page powered by Payrexx.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>{isRecruiter ? "Recruiter" : "Company"} plan</span>
                    <span>CHF 9.90</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-zinc-900 dark:text-zinc-50">
                    <span>Total / month</span>
                    <span>CHF 9.90</span>
                  </div>
                </div>

                <form action={startSubscription}>
                  <Button type="submit" className="w-full gap-2" size="lg">
                    Continue to payment
                  </Button>
                </form>

                <p className="text-center text-xs text-zinc-400">
                  By subscribing you agree to our{" "}
                  <Link href="/terms" className="underline">Terms</Link>.
                  Payments handled by Payrexx. We never see your card details.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
