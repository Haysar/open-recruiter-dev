"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function acceptCompanyInvite(inviteLink: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/join/${inviteLink}`)
  }

  const userId = session.user.id

  // Verify the user is a RECRUITER
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true },
  })
  if (user.role !== "RECRUITER") {
    throw new Error("Only recruiters can join a company via invite link.")
  }

  // Load the recruiter profile
  const recruiterProfile = await prisma.recruiterProfile.findUnique({
    where: { userId },
    select: { id: true, companyId: true },
  })
  if (!recruiterProfile) {
    redirect("/r/onboarding")
  }

  // Load the company by inviteLink token
  const company = await prisma.companyProfile.findUnique({
    where: { inviteLink },
    select: { id: true, slug: true },
  })
  if (!company) {
    throw new Error("Invite link is invalid or has expired.")
  }

  // Connect recruiter to the company
  await prisma.recruiterProfile.update({
    where: { id: recruiterProfile.id },
    data: {
      companyId: company.id,
      connectedAt: new Date(),
    },
  })

  redirect(`/c/${company.slug}?joined=1`)
}
