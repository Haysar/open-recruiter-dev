import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ShieldCheck,
  Star,
  Search,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Static mock data — replaced by real DB queries post-MVP
// ---------------------------------------------------------------------------

const STATS = [
  { label: "Recruiters rated", value: "—" },
  { label: "Verified reviews", value: "—" },
  { label: "Companies tracked", value: "—" },
]

const FEATURES_CANDIDATES = [
  "Rate on 4 dimensions: experience, speed, transparency, knowledge",
  "Auth-verified identity — your LinkedIn or Google account",
  "6-month re-review window to reflect growth",
  "Evidence upload for 1-star reviews to prevent abuse",
]

const FEATURES_RECRUITERS = [
  "Public profile with aggregated star ratings",
  "Shareable invite code for your email signature",
  "Dashboard to monitor your reputation over time",
  "Connect to your company or go independent",
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NavBar({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <ShieldCheck className="h-5 w-5" />
          Open-Recruiter
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400 sm:flex">
          <Link href="/search" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Find recruiters
          </Link>
          <Link href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            How it works
          </Link>
          <Link
            href={process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-in">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function HeroSection({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Badge variant="secondary" className="mb-4 gap-1.5">
          <Lock className="h-3 w-3" />
          Open-source &amp; privacy-first
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl md:text-6xl">
          Rate your recruiter.
          <br />
          <span className="text-zinc-500">Build accountability.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Verified reviews by real candidates. Recruiters earn a public profile
          they can share. Candidates leave honest feedback, protected by
          OAuth identity verification.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {isSignedIn ? (
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                Go to dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="gap-2">
                <Link href="/sign-in">
                  Leave a review <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/search">Browse recruiters</Link>
              </Button>
            </>
          )}
        </div>

        {/* Stats row */}
        <div className="mx-auto mt-14 grid max-w-sm grid-cols-3 gap-6 sm:max-w-md">
          {STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Lock,
      step: "1",
      title: "Sign in with OAuth",
      body: "Use LinkedIn, Google, or Apple. Your identity is verified — anonymous reviews aren't accepted.",
    },
    {
      icon: Star,
      step: "2",
      title: "Rate your recruiter",
      body: "Score on candidate experience, speed, transparency, and knowledge. Add a comment and optional evidence.",
    },
    {
      icon: Users,
      step: "3",
      title: "Build the community",
      body: "Ratings aggregate on each recruiter's public profile. Great recruiters rise; bad actors are held accountable.",
    },
  ]

  return (
    <section id="how-it-works" className="bg-zinc-50 py-20 dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Three steps to a more accountable recruiting industry.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, body }) => (
            <Card key={step} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <Icon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Step {step}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ForCandidatesSection() {
  return (
    <section className="bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-5xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
        <div>
          <Badge variant="secondary" className="mb-4">For candidates</Badge>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Your experience matters.
            <br />
            Make it count.
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Had a great recruiter? Terrible ghosting experience? Recruiters
            build their careers off candidates — now candidates have a voice.
          </p>
          <ul className="mt-6 space-y-3">
            {FEATURES_CANDIDATES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-8 gap-2">
            <Link href="/sign-in">
              Write a review <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Decorative review card mockup */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Alex M.
              </p>
              <p className="text-xs text-zinc-400">Software Engineer</p>
            </div>
            <Badge variant="secondary" className="ml-auto gap-1 text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              LinkedIn
            </Badge>
          </div>
          <Separator className="my-4" />
          <div className="flex gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            "Fantastic recruiter — kept me informed at every stage, understood
            the role well, and respected my time. Would highly recommend."
          </p>
          <div className="mt-4 flex gap-4 text-xs text-zinc-400">
            <span>Experience 5/5</span>
            <span>Speed 5/5</span>
            <span>Transparency 5/5</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ForRecruitersSection() {
  return (
    <section className="bg-zinc-50 py-20 dark:bg-zinc-900">
      <div className="mx-auto grid max-w-5xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
        {/* Decorative profile card mockup */}
        <div className="order-last rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:order-first">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">Sarah K.</p>
              <p className="text-sm text-zinc-500">Senior Recruiter · Tech &amp; Startup</p>
              <div className="mt-1 flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4].map((n) => (
                  <Star key={n} className="h-3.5 w-3.5 fill-current" />
                ))}
                <Star className="h-3.5 w-3.5 fill-zinc-200 dark:fill-zinc-700" />
                <span className="ml-1 text-xs text-zinc-500">4.2 (18 reviews)</span>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Candidate exp.", value: "4.5" },
              { label: "Speed", value: "4.0" },
              { label: "Transparency", value: "4.3" },
              { label: "Knowledge", value: "4.1" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                <p className="text-xs text-zinc-400">{label}</p>
                <p className="font-semibold text-zinc-800 dark:text-zinc-100">{value}/5</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Building2 className="h-3 w-3" />
              Acme Corp
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              OPENREC-SARAH-2026
            </Badge>
          </div>
        </div>

        <div>
          <Badge variant="secondary" className="mb-4">For recruiters</Badge>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Your reputation
            <br />
            belongs to you.
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Great recruiters deserve recognition. Build a verified public
            profile that travels with you — independent of any employer.
          </p>
          <ul className="mt-6 space-y-3">
            {FEATURES_RECRUITERS.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-8 gap-2">
            <Link href="/sign-in">
              Claim your profile <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function OpenSourceSection() {
  return (
    <section className="bg-zinc-900 py-16 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <GithubIcon className="mx-auto mb-4 h-8 w-8 text-zinc-400" />
        <h2 className="text-2xl font-bold text-white">
          100% open-source. Swiss-hosted. No ads, no VC money.
        </h2>
        <p className="mt-4 text-zinc-400">
          Open-Recruiter is MIT-licensed and community-driven. The entire
          codebase is public — audit it, fork it, self-host it. Data is stored
          in Switzerland under Swiss privacy law.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-8 gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Link
            href={process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon className="h-4 w-4" />
            View on GitHub
          </Link>
        </Button>
      </div>
    </section>
  )
}

function SearchTeaser() {
  return (
    <section className="bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Search className="mx-auto mb-4 h-8 w-8 text-zinc-400" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Find a recruiter
        </h2>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          Search by name or company to see verified ratings from real candidates.
        </p>
        <Button asChild className="mt-6 gap-2" size="lg">
          <Link href="/search">
            <Search className="h-4 w-4" />
            Browse all recruiters
          </Link>
        </Button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Open-Recruiter — Community-driven recruiter accountability</span>
        </div>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-300">Terms</Link>
          <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-300">Privacy</Link>
          <Link
            href={process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const session = await auth()
  const isSignedIn = !!session?.user

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <NavBar isSignedIn={isSignedIn} />
      <HeroSection isSignedIn={isSignedIn} />
      <HowItWorksSection />
      <ForCandidatesSection />
      <ForRecruitersSection />
      <SearchTeaser />
      <OpenSourceSection />
      <Footer />
    </div>
  )
}