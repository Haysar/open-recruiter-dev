"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"

export function EmailSignInForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!email) return

    setStatus("loading")
    const result = await signIn("nodemailer", {
      email,
      redirect: false,
      callbackUrl: "/welcome",
    })

    if (result?.error) {
      setStatus("error")
    } else {
      setStatus("sent")
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
        <Mail className="mx-auto mb-2 h-5 w-5" />
        <p className="font-medium">Check your email</p>
        <p className="mt-1 text-green-700 dark:text-green-300">
          A sign-in link was sent to <strong>{email}</strong>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
          autoComplete="email"
        />
      </div>
      {status === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Something went wrong. Please try again.
        </p>
      )}
      <Button
        type="submit"
        variant="outline"
        className="w-full gap-2"
        disabled={status === "loading" || !email}
      >
        <Mail className="h-4 w-4" />
        {status === "loading" ? "Sending link…" : "Continue with Email"}
      </Button>
    </form>
  )
}
