import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Privacy Policy — Open-Recruiter",
}

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-zinc dark:prose-invert mt-8 max-w-none text-sm leading-7">

          <h2>1. Who We Are</h2>
          <p>
            Open-Recruiter is an open-source recruiter review platform. Data is hosted in Switzerland
            with Infomaniak, subject to Swiss data protection law (nDSG) and, where applicable, the GDPR.
          </p>

          <h2>2. Data We Collect</h2>

          <h3>Account data (via OAuth)</h3>
          <p>
            When you sign in with LinkedIn, Google, Apple, or email, we receive and store:
          </p>
          <ul>
            <li>Name and email address</li>
            <li>Profile picture URL (if provided by the OAuth provider)</li>
            <li>OAuth provider tokens (access token, refresh token) — stored encrypted</li>
          </ul>

          <h3>Review data</h3>
          <p>
            Reviews you submit are stored and associated with your account. Published reviews display
            your name and which OAuth provider you used to sign in (as a &quot;trust badge&quot;).
            The underlying OAuth tokens and email are not exposed publicly.
          </p>

          <h3>Recruiter profile data</h3>
          <p>
            Data entered into your recruiter or company profile (bio, LinkedIn URL, company name)
            is stored and publicly displayed on your profile page.
          </p>

          <h3>Usage data</h3>
          <p>
            We do not use third-party analytics. No tracking pixels, cookies (other than those
            required for authentication), or advertising identifiers are used.
          </p>

          <h2>3. How We Use Your Data</h2>
          <ul>
            <li>To authenticate you and maintain your session</li>
            <li>To display your reviews and profile publicly</li>
            <li>To compute and display recruiter ratings</li>
            <li>To send authentication emails (magic links)</li>
            <li>To process subscription payments via Payrexx</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>We do not sell your data. We share data only with:</p>
          <ul>
            <li>
              <strong>Infomaniak</strong> — hosting provider (Switzerland). Database and file storage.
            </li>
            <li>
              <strong>Payrexx</strong> — payment processor (Switzerland). Only payment-relevant data.
            </li>
            <li>
              <strong>OAuth providers</strong> — LinkedIn, Google, Apple handle the authentication flow.
              Their privacy policies apply to that interaction.
            </li>
          </ul>

          <h2>5. AI Moderation</h2>
          <p>
            Review content may be sent to a third-party AI API (configurable by the admin — Mistral,
            Gemini, Claude, or OpenAI) for automated moderation. Only the review text is sent, with
            no personally identifying information attached.
          </p>

          <h2>6. Cookies</h2>
          <p>We use only the following cookies:</p>
          <ul>
            <li>
              <strong>next-auth.session-token</strong> — httpOnly session cookie for authentication
            </li>
            <li>
              <strong>onboarding_done</strong> — httpOnly cookie to track first-time user onboarding state
            </li>
          </ul>
          <p>No advertising or tracking cookies are used.</p>

          <h2>7. Data Retention</h2>
          <p>
            Account data is retained for the lifetime of your account. Reviews remain after account
            deletion but are anonymised (candidate name replaced with &quot;Anonymous&quot;).
            You may request full deletion by contacting us.
          </p>

          <h2>8. Your Rights</h2>
          <p>
            Under Swiss nDSG and GDPR (where applicable) you have the right to:
          </p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and personal data</li>
            <li>Object to certain processing</li>
            <li>Receive a copy of your data in a machine-readable format</li>
          </ul>
          <p>
            To exercise these rights, open an issue on{" "}
            <a
              href={process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 underline dark:text-zinc-100"
            >
              GitHub
            </a>{" "}
            or email privacy@open-recruiter.com.
          </p>

          <h2>9. Open-Source Transparency</h2>
          <p>
            Because Open-Recruiter is fully open-source, you can audit exactly what data is collected
            and how it is processed by reviewing the source code on GitHub.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. Continued use after changes constitutes acceptance.
            Material changes will be communicated by email.
          </p>

          <h2>11. Contact</h2>
          <p>
            Privacy questions:{" "}
            <Link href="/terms" className="text-zinc-900 underline dark:text-zinc-100">
              Terms of Service
            </Link>{" "}
            · privacy@open-recruiter.com
          </p>
        </div>
      </main>
    </div>
  )
}
