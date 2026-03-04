"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPayrexxGateway } from "@/lib/payrexx"
import { redirect } from "next/navigation"

// Monthly subscription price in CHF
const SUBSCRIPTION_PRICE_CHF = 9.90

export async function startSubscription(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const userId = session.user.id
  const userEmail = (session.user as { email?: string | null }).email ?? undefined

  // Check the user isn't already on an active subscription
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { subscriptionStatus: true },
  })

  if (user.subscriptionStatus === "ACTIVE") {
    redirect("/dashboard?already_subscribed=1")
  }

  const referralCode = String(formData.get("referralCode") ?? "").trim() || null
  let discountPercent = 0
  let referralCodeRecord = null

  if (referralCode) {
    referralCodeRecord = await prisma.referralCode.findUnique({
      where: { code: referralCode },
      select: { id: true, discountPercent: true },
    })
    if (referralCodeRecord) {
      discountPercent = referralCodeRecord.discountPercent
    }
  }

  const finalPrice = SUBSCRIPTION_PRICE_CHF * (1 - discountPercent / 100)

  // Create the Subscription record first so we have an ID for Payrexx referenceId
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      amount: finalPrice,
      currency: "CHF",
      status: "TRIAL",
      referralCodeApplied: referralCodeRecord?.id ?? null,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://open-recruiter.com"

  // Create Payrexx gateway and get hosted payment URL
  const gateway = await createPayrexxGateway({
    amount: finalPrice,
    subscriptionId: subscription.id,
    customerEmail: userEmail,
    returnUrl: `${appUrl}/subscribe/success?sub=${subscription.id}`,
    cancelUrl: `${appUrl}/subscribe/cancel`,
  })

  redirect(gateway.link)
}
