"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function generateInviteCode(name: string): string {
  const year = new Date().getFullYear()
  const first = name.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `OPENREC-${first}-${year}-${suffix}`
}

export async function createRecruiterProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const displayName = (formData.get("displayName") as string)?.trim()
  const bio = (formData.get("bio") as string)?.trim() || null
  const linkedInUrl = (formData.get("linkedInUrl") as string)?.trim() || null

  if (!displayName) throw new Error("Display name is required")

  const baseSlug = slugify(displayName)

  // Ensure slug uniqueness by appending a counter if needed
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const existing = await prisma.recruiterProfile.findUnique({ where: { slug } })
    if (!existing) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const inviteCode = generateInviteCode(displayName)

  await prisma.recruiterProfile.create({
    data: {
      userId: session.user.id,
      slug,
      bio,
      linkedInUrl,
      inviteCode,
    },
  })

  redirect("/dashboard")
}
