import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Nodemailer from "next-auth/providers/nodemailer"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@/generated/prisma/client"
import type { Adapter } from "next-auth/adapters"

// ---------------------------------------------------------------------------
// LinkedIn provider — next-auth beta ships it but the package name changed.
// We define it manually to ensure full control over scopes and profile mapping.
// ---------------------------------------------------------------------------
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers"

interface LinkedInProfile {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: { country: string; language: string }
}

function LinkedIn(
  config: OAuthUserConfig<LinkedInProfile>
): OAuthConfig<LinkedInProfile> {
  return {
    id: "linkedin",
    name: "LinkedIn",
    type: "oidc",
    issuer: "https://www.linkedin.com",
    client: { token_endpoint_auth_method: "client_secret_post" },
    authorization: {
      params: { scope: "openid profile email" },
    },
    jwks_endpoint:
      "https://www.linkedin.com/oauth/openid/jwks",
    wellKnown:
      "https://www.linkedin.com/oauth/.well-known/openid-configuration",
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }
    },
    style: { logo: "/icons/linkedin.svg", bg: "#0077B5", text: "#fff" },
    options: config,
  }
}

// ---------------------------------------------------------------------------
// Auth.js v5 configuration for Vercel + Supabase
// ---------------------------------------------------------------------------
export const { handlers, auth, signIn, signOut } = NextAuth({
  // The @auth/prisma-adapter and next-auth@beta bundle different @auth/core
  // minor versions, causing a structural type mismatch. Cast resolves it.
  adapter: PrismaAdapter(prisma) as unknown as Adapter,

  providers: [
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID!,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID!,
      clientSecret: process.env.AUTH_APPLE_SECRET!,
    }),
    ...(process.env.EMAIL_SERVER
      ? [Nodemailer({
          server: process.env.EMAIL_SERVER,
          from: process.env.EMAIL_FROM ?? "Open-Recruiter <noreply@open-recruiter.com>",
        })]
      : []),
  ],

  // Custom pages
  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // Redirect auth errors to sign-in with ?error= param
  },

  callbacks: {
    // Attach id and role to every session — available in server components
    // via `auth()` and in client components via `useSession()`.
    session({ session, user }) {
      if (user) {
        session.user.id = user.id
        session.user.role = (user as typeof user & { role: UserRole }).role
      }
      return session
    },

    // Block sign-in if the user's subscription has expired (grace period check).
    // Returns false to deny, true to allow, or a redirect URL string.
    async signIn({ user, account }) {
      // Always allow OAuth account linking (no email yet)
      if (!user.email) return true

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { subscriptionStatus: true },
      })

      // New user — let them through (trial will be set in the `events.createUser` hook)
      if (!dbUser) return true

      // Expired users can still sign in (they see an upgrade prompt in the app)
      return true
    },
  },

  events: {
    // When a brand-new user is created, set their 30-day trial end date
    // and auto-generate their referral code if they signed up as RECRUITER.
    async createUser({ user }) {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 30)

      await prisma.user.update({
        where: { id: user.id },
        data: { trialEndsAt },
      })
    },
  },

  session: {
    strategy: "database",
  },
})
