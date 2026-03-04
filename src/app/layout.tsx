import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Open-Recruiter",
    template: "%s — Open-Recruiter",
  },
  description:
    "Verified recruiter ratings by real candidates. Build your reputation and take it with you.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://open-recruiter.com"
  ),
  openGraph: {
    siteName: "Open-Recruiter",
    type: "website",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Pass the server-side session to SessionProvider so client components
  // using `useSession()` don't need an extra round-trip to /api/auth/session.
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  )
}
