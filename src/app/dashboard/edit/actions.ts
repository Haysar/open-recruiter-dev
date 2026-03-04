"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateRecruiterProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const bio = (formData.get("bio") as string)?.trim() || null
  const linkedInUrl = (formData.get("linkedInUrl") as string)?.trim() || null
  const isPublic = formData.get("isPublic") === "true"

  if (linkedInUrl && !/^https?:\/\/(www\.)?linkedin\.com\//i.test(linkedInUrl)) {
    throw new Error("LinkedIn URL must start with https://linkedin.com/")
  }

  await prisma.recruiterProfile.update({
    where: { userId: session.user.id },
    data: { bio, linkedInUrl, isPublic },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/edit")

  redirect("/dashboard")
}
