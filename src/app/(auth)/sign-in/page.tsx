import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  LinkedInSignInButton,
  GoogleSignInButton,
  AppleSignInButton,
} from "@/components/auth/sign-in-buttons"
import { EmailSignInForm } from "@/components/auth/email-sign-in-form"
import { ShieldCheck } from "lucide-react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Sign In — Open-Recruiter",
  description: "Sign in to leave or manage recruiter reviews.",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  // Already signed in → redirect to dashboard
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  const params = await searchParams
  const error = params.error

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Could not start the sign-in flow. Please try again.",
    OAuthCallback: "An error occurred during sign-in. Please try again.",
    OAuthCreateAccount: "Could not create your account. Please try again.",
    EmailCreateAccount: "Could not create your account. Please try again.",
    Callback: "An error occurred. Please try again.",
    OAuthAccountNotLinked:
      "This email is already linked to a different sign-in method.",
    EmailSignin: "Failed to send the magic link. Check your email address.",
    CredentialsSignin: "Invalid credentials.",
    default: "An unexpected error occurred. Please try again.",
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-zinc-900 dark:text-zinc-100" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Open-Recruiter
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Your reputation, built by candidates.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>
              Choose a method below. LinkedIn gives your reviews the highest
              trust badge.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Auth error banner */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                {errorMessages[error] ?? errorMessages.default}
              </div>
            )}

            {/* OAuth providers */}
            <LinkedInSignInButton />
            <GoogleSignInButton />
            <AppleSignInButton />

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <Separator className="flex-1" />
              <span className="text-xs text-zinc-400">or</span>
              <Separator className="flex-1" />
            </div>

            {/* Email magic link */}
            <EmailSignInForm />
          </CardContent>
        </Card>

        {/* Trust footer */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          By signing in you agree to our{" "}
          <a href="/terms" className="underline underline-offset-2 hover:text-zinc-700">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-zinc-700">
            Privacy Policy
          </a>
          . Authentication is required to prevent fake reviews.
        </p>
      </div>
    </div>
  )
}
