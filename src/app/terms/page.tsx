import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Terms of Service — Open-Recruiter",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Terms of Service</h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-zinc dark:prose-invert mt-8 max-w-none text-sm leading-7">

          <h2>1. Acceptance of Terms</h2>
          <p>
            By creating an account or using Open-Recruiter (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree, you may not use the Service.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old and have the legal capacity to enter into a binding agreement.
            By using the Service you represent that you meet these requirements.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            Authentication is provided through OAuth providers (LinkedIn, Google, Apple) or email magic links.
            You are responsible for maintaining the security of your account and all activity that occurs under it.
          </p>

          <h2>4. Review Content</h2>
          <p>
            Reviews must be based on genuine first-hand interactions with the recruiter being rated.
            You agree not to post:
          </p>
          <ul>
            <li>False, misleading, or defamatory statements</li>
            <li>Content you have not personally experienced</li>
            <li>Reviews submitted on behalf of another person</li>
            <li>Spam, promotional content, or AI-generated text presented as personal experience</li>
          </ul>
          <p>
            One-star reviews require supporting evidence (screenshot or document) to protect against
            false reports. Submitting fabricated evidence is a violation of these Terms and may result
            in permanent account termination.
          </p>

          <h2>5. Re-review Policy</h2>
          <p>
            A 6-month cooling-off period applies between reviews of the same recruiter. This allows
            time for improvement and prevents review flooding.
          </p>

          <h2>6. Content Moderation</h2>
          <p>
            Open-Recruiter reserves the right to remove, flag, or modify any review that violates these
            Terms. Recruiters may dispute reviews; disputed reviews are placed under moderation and reviewed
            by our team.
          </p>

          <h2>7. Recruiter Profiles</h2>
          <p>
            Recruiters who create a profile on Open-Recruiter consent to being reviewed by candidates who
            have interacted with them professionally. Recruiters may not attempt to manipulate their own
            ratings or submit reviews of themselves or their competitors.
          </p>

          <h2>8. Subscriptions & Payments</h2>
          <p>
            Recruiter and company accounts may require a paid subscription after a free trial period.
            Payments are processed by Payrexx. All prices are in Swiss Francs (CHF).
            Subscriptions are non-refundable except where required by applicable law.
          </p>

          <h2>9. Open-Source License</h2>
          <p>
            The Open-Recruiter codebase is released under the MIT License. Self-hosted instances
            are subject to MIT License terms, not these Terms of Service (which apply only to the
            hosted service at open-recruiter.com).
          </p>

          <h2>10. Data & Privacy</h2>
          <p>
            Your use of the Service is also governed by our{" "}
            <Link href="/privacy" className="text-zinc-900 underline dark:text-zinc-100">
              Privacy Policy
            </Link>
            . Data is hosted in Switzerland.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            Open-Recruiter is provided &quot;as is&quot; without warranties of any kind. To the maximum extent
            permitted by law, Open-Recruiter shall not be liable for any indirect, incidental, or
            consequential damages arising from your use of the Service.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the Service after changes
            constitutes acceptance of the updated Terms. We will notify active users of material changes
            by email.
          </p>

          <h2>13. Contact</h2>
          <p>
            Questions about these Terms? Open an issue on{" "}
            <a
              href={process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 underline dark:text-zinc-100"
            >
              GitHub
            </a>{" "}
            or email legal@open-recruiter.com.
          </p>
        </div>
      </main>
    </div>
  )
}
