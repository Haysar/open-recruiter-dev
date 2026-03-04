import Link from "next/link"
import { ShieldCheck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Payment pending — Open-Recruiter" }

// Payrexx redirects here after a successful payment attempt.
// The actual status update happens via the webhook; this page is just UI feedback.
export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string }>
}) {
  await searchParams // consumed but not used — webhook handles state

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Payment received!</h1>
          <p className="mt-2 text-zinc-500">
            Thank you for subscribing. Your account will be activated within a few seconds once
            the payment is confirmed by Payrexx.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            If your account is not activated after a few minutes, please contact support.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
