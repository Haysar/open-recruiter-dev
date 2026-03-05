import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const user = token as { role?: string } | null

  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/sign-in", req.url))
    if (user.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const signInUrl = new URL("/sign-in", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  if (pathname.startsWith("/r/onboarding")) {
    if (!user) return NextResponse.redirect(new URL("/sign-in", req.url))
    if (user.role !== "RECRUITER" && user.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (pathname.startsWith("/c/onboarding")) {
    if (!user) return NextResponse.redirect(new URL("/sign-in", req.url))
    if (user.role !== "COMPANY" && user.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
