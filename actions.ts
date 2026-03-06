"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

// ---------------------------------------------------------------------------
// Static Payrexx Payment Link (temporary — will be replaced by full API
// integration later, see src/lib/payrexx.ts for the prepared gateway code)
// ---------------------------------------------------------------------------

export async function startSubscription() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const paymentLink = process.env.NEXT_PUBLIC_PAYREXX_PAYMENT_LINK
  if (!paymentLink) {
    throw new Error("NEXT_PUBLIC_PAYREXX_PAYMENT_LINK is not configured.")
  }

  // Check the user isn't already on an active subscription
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { subscriptionStatus: true },
  })

  if (user.subscriptionStatus === "ACTIVE") {
    redirect("/dashboard?already_subscribed=1")
  }

  // Redirect to static Payrexx payment page
  redirect(paymentLink)
}
