import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createCompanyProfile } from "./actions"
import { ShieldCheck, Building2 } from "lucide-react"
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

export const metadata = {
  title: "Company Setup — Open-Recruiter",
}

export default async function CompanyOnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  // Already has a profile → go to dashboard
  const existing = await prisma.companyProfile.findUnique({
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
          <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
            <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Set up your company profile
          </h1>
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Your company page aggregates ratings across all connected recruiters.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Company details</CardTitle>
            <CardDescription>You can invite recruiters to connect once your profile is created.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCompanyProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Company name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Acme Corp"
                  required
                  autoFocus
                />
                <p className="text-xs text-zinc-400">
                  Used to generate your company URL (e.g. /c/acme-corp)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://acme.com"
                />
              </div>

              <Button type="submit" className="w-full">
                Create company profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
