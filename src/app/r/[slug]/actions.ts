"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function flagReview(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/sign-in")
  }

  const reviewId = String(formData.get("reviewId") ?? "")
  if (!reviewId) throw new Error("Missing reviewId")

  const review = await prisma.review.findUniqueOrThrow({
    where: { id: reviewId },
    select: { id: true, status: true, recruiter: { select: { slug: true } } },
  })

  // Only PUBLISHED reviews can be flagged
  if (review.status !== "PUBLISHED") return

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: "FLAGGED" },
  })

  revalidatePath(`/r/${review.recruiter.slug}`)
}
