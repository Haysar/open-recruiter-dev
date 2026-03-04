import Link from "next/link"
import { ShieldCheck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Payment cancelled — Open-Recruiter" }

export default function SubscribeCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <XCircle className="h-8 w-8 text-zinc-400" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Payment cancelled</h1>
          <p className="mt-2 text-zinc-500">
            No charge was made. You can subscribe at any time from your dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/subscribe">Try again</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
