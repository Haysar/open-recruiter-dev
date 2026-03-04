"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { UserRole } from "@/generated/prisma/client"

const VALID_ROLES: UserRole[] = ["CANDIDATE", "RECRUITER", "COMPANY"]

async function markOnboardingDone() {
  const jar = await cookies()
  jar.set("onboarding_done", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

export async function setUserRole(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/sign-in")
  }

  const rawRole = formData.get("role") as string
  if (!VALID_ROLES.includes(rawRole as UserRole)) {
    throw new Error("Invalid role")
  }

  const role = rawRole as UserRole

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  })

  await markOnboardingDone()

  if (role === "RECRUITER") {
    redirect("/r/onboarding")
  } else if (role === "COMPANY") {
    redirect("/c/onboarding")
  } else {
    redirect("/dashboard")
  }
}
