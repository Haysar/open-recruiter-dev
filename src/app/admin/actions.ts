"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"
import { revalidatePath } from "next/cache"
import type { AiProvider, ReviewStatus } from "@/generated/prisma/client"

// ---------------------------------------------------------------------------
// Guard helper — all admin actions require ADMIN role
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user?.id || role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session.user.id
}

// ---------------------------------------------------------------------------
// AI Settings
// ---------------------------------------------------------------------------

const VALID_PROVIDERS: AiProvider[] = ["MISTRAL", "GEMINI", "CLAUDE", "OPENAI"]

export async function saveAiSettings(formData: FormData) {
  const adminId = await requireAdmin()

  const rawProvider = String(formData.get("aiProvider") ?? "")
  if (!VALID_PROVIDERS.includes(rawProvider as AiProvider)) {
    throw new Error("Invalid AI provider.")
  }
  const aiProvider = rawProvider as AiProvider

  const rawKey = String(formData.get("aiApiKey") ?? "").trim()

  // Load existing record (singleton)
  const existing = await prisma.adminSettings.findFirst()

  if (existing) {
    await prisma.adminSettings.update({
      where: { id: existing.id },
      data: {
        aiProvider,
        // Only update the key if a new one was supplied
        ...(rawKey ? { aiApiKeyEncrypted: encrypt(rawKey) } : {}),
        updatedBy: adminId,
      },
    })
  } else {
    await prisma.adminSettings.create({
      data: {
        aiProvider,
        aiApiKeyEncrypted: rawKey ? encrypt(rawKey) : null,
        updatedBy: adminId,
      },
    })
  }

  revalidatePath("/admin")
}

// ---------------------------------------------------------------------------
// Review moderation
// ---------------------------------------------------------------------------

const VALID_MODERATION_STATUSES: ReviewStatus[] = ["PUBLISHED", "REMOVED"]

export async function moderateReview(formData: FormData) {
  await requireAdmin()

  const reviewId = String(formData.get("reviewId") ?? "")
  const rawStatus = String(formData.get("status") ?? "")
  const disputeNote = String(formData.get("disputeNote") ?? "").trim() || null

  if (!reviewId) throw new Error("Missing reviewId")
  if (!VALID_MODERATION_STATUSES.includes(rawStatus as ReviewStatus)) {
    throw new Error("Invalid status")
  }

  const review = await prisma.review.findUniqueOrThrow({
    where: { id: reviewId },
    select: { id: true, recruiterId: true, status: true, overallRating: true },
  })

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: rawStatus as ReviewStatus,
      disputeNote,
    },
  })

  // If a review is removed, recompute the recruiter's averages from scratch
  if (rawStatus === "REMOVED" && review.status !== "REMOVED") {
    await recomputeRecruiterAverages(review.recruiterId)
  }

  // If a removed review is reinstated to PUBLISHED, recompute too
  if (rawStatus === "PUBLISHED" && review.status === "REMOVED") {
    await recomputeRecruiterAverages(review.recruiterId)
  }

  revalidatePath("/admin")
}

// ---------------------------------------------------------------------------
// User role management
// ---------------------------------------------------------------------------

export async function updateUserRole(formData: FormData) {
  await requireAdmin()

  const userId = String(formData.get("userId") ?? "")
  const role = String(formData.get("role") ?? "")

  if (!userId || !["ADMIN", "RECRUITER", "COMPANY", "CANDIDATE"].includes(role)) {
    throw new Error("Invalid user or role")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as never },
  })

  revalidatePath("/admin")
}

// ---------------------------------------------------------------------------
// Internal: full recompute of recruiter averages
// ---------------------------------------------------------------------------

async function recomputeRecruiterAverages(recruiterId: string) {
  const agg = await prisma.review.aggregate({
    where: { recruiterId, status: "PUBLISHED" },
    _avg: {
      overallRating: true,
      ratingCandidateExperience: true,
      ratingSpeed: true,
      ratingTransparency: true,
      ratingKnowledge: true,
    },
    _count: { id: true },
  })

  await prisma.recruiterProfile.update({
    where: { id: recruiterId },
    data: {
      reviewCount: agg._count.id,
      totalRatingAvg: agg._avg.overallRating ?? 0,
      ratingCandidateExperienceAvg: agg._avg.ratingCandidateExperience ?? 0,
      ratingSpeedAvg: agg._avg.ratingSpeed ?? 0,
      ratingTransparencyAvg: agg._avg.ratingTransparency ?? 0,
      ratingKnowledgeAvg: agg._avg.ratingKnowledge ?? 0,
    },
  })
}
