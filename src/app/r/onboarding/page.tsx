import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createRecruiterProfile } from "./actions"
import { ShieldCheck, Briefcase } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const metadata = {
  title: "Recruiter Setup — Open-Recruiter",
}

export default async function RecruiterOnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  // Already has a profile → go to dashboard
  const existing = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (existing) redirect("/dashboard")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-6 w-6" />
            <span className="font-bold tracking-tight">Open-Recruiter</span>
          </div>
          <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950">
            <Briefcase className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Set up your recruiter profile
          </h1>
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            This is your public profile. Candidates will see this when they write a review.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Profile details</CardTitle>
            <CardDescription>You can edit everything later in your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createRecruiterProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Full name *</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="Alex Johnson"
                  defaultValue={session.user.name ?? ""}
                  required
                  autoFocus
                />
                <p className="text-xs text-zinc-400">
                  Used to generate your profile URL (e.g. /r/alex-johnson)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Senior tech recruiter specialising in engineering and product roles…"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="linkedInUrl">LinkedIn profile URL</Label>
                <Input
                  id="linkedInUrl"
                  name="linkedInUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

              <Button type="submit" className="w-full">
                Create my profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
