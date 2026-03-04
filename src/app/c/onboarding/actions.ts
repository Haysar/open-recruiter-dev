"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { randomBytes } from "crypto"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function createCompanyProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const name = (formData.get("name") as string)?.trim()
  const website = (formData.get("website") as string)?.trim() || null

  if (!name) throw new Error("Company name is required")

  const baseSlug = slugify(name)

  // Ensure slug uniqueness
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const existing = await prisma.companyProfile.findUnique({ where: { slug } })
    if (!existing) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const inviteLink = randomBytes(24).toString("hex")

  await prisma.companyProfile.create({
    data: {
      userId: session.user.id,
      name,
      slug,
      website,
      inviteLink,
    },
  })

  redirect("/dashboard")
}
