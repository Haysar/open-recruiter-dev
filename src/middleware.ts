import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { UserRole } from "@/generated/prisma/client"

/**
 * Route protection middleware using Auth.js v5.
 *
 * Protected routes:
 *   /dashboard/*  — any authenticated user
 *   /admin/*      — ADMIN role only
 *   /r/onboarding — RECRUITER role only (after sign-up)
 *   /c/onboarding — COMPANY role only (after sign-up)
 *
 * Everything else (landing page, public recruiter profiles, sign-in) is public.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl
  type AuthUser = { role: UserRole; id: string; name?: string | null; email?: string | null }
  const user = req.auth?.user as AuthUser | undefined

  // ── /admin/* ──────────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", req.url))
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // ── /dashboard/* ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const signInUrl = new URL("/sign-in", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // ── /r/onboarding — recruiter-only ───────────────────────────────────────
  if (pathname.startsWith("/r/onboarding")) {
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", req.url))
    }
    if (user.role !== "RECRUITER" && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // ── /c/onboarding — company-only ─────────────────────────────────────────
  if (pathname.startsWith("/c/onboarding")) {
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", req.url))
    }
    if (user.role !== "COMPANY" && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  // Run middleware on all routes except static assets and Next.js internals.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
