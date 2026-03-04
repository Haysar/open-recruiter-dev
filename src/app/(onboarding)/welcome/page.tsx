import { auth } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { setUserRole } from "./actions"
import { ShieldCheck, User, Briefcase, Building2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Welcome — Open-Recruiter",
  description: "Choose your role to get started.",
}

// Role option cards displayed on the welcome page
const ROLES = [
  {
    id: "CANDIDATE" as const,
    icon: User,
    title: "I'm a candidate",
    description:
      "I want to rate recruiters I've worked with and help other job seekers make informed decisions.",
    cta: "Continue as candidate",
    accent: "border-blue-200 hover:border-blue-400 dark:border-blue-900 dark:hover:border-blue-600",
    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    id: "RECRUITER" as const,
    icon: Briefcase,
    title: "I'm a recruiter",
    description:
      "I want to build my verified public profile and track my reputation across companies.",
    cta: "Continue as recruiter",
    accent: "border-violet-200 hover:border-violet-400 dark:border-violet-900 dark:hover:border-violet-600",
    iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  },
  {
    id: "COMPANY" as const,
    icon: Building2,
    title: "I represent a company",
    description:
      "I want to manage our company profile and see aggregate ratings for our recruiting team.",
    cta: "Continue as company",
    accent: "border-emerald-200 hover:border-emerald-400 dark:border-emerald-900 dark:hover:border-emerald-600",
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  },
]

export default async function WelcomePage() {
  const session = await auth()

  // Not signed in → back to sign-in
  if (!session?.user) {
    redirect("/sign-in")
  }

  // Users who completed onboarding (cookie) or have a non-default role skip to dashboard
  const jar = await cookies()
  const onboardingDone = jar.get("onboarding_done")?.value === "1"
  const role = (session.user as { role?: string }).role
  if (onboardingDone || (role && role !== "CANDIDATE")) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          <ShieldCheck className="h-7 w-7" />
          <span className="text-xl font-bold tracking-tight">Open-Recruiter</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Welcome{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          How will you use Open-Recruiter? You can change this later in settings.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {ROLES.map(({ id, icon: Icon, title, description, cta, accent, iconBg }) => (
          <form key={id} action={setUserRole}>
            <input type="hidden" name="role" value={id} />
            <button type="submit" className="w-full text-left">
              <Card
                className={`h-full cursor-pointer border-2 transition-colors ${accent}`}
              >
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {cta} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </button>
          </form>
        ))}
      </div>

      {/* Skip — still sets the cookie so user isn't re-prompted */}
      <form action={setUserRole} className="mt-8">
        <input type="hidden" name="role" value="CANDIDATE" />
        <input type="hidden" name="skip" value="1" />
        <Button type="submit" variant="ghost" size="sm" className="text-zinc-400">
          Skip for now
        </Button>
      </form>
    </div>
  )
}
