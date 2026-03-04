/**
 * Payrexx Webhook Handler
 *
 * Payrexx sends a POST with form-encoded body containing a `payhash` field.
 * The payhash is an HMAC-SHA256 of the raw body using PAYREXX_WEBHOOK_SECRET.
 *
 * Docs: https://developers.payrexx.com/docs/webhook
 */

import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { prisma } from "@/lib/prisma"

// Payrexx sends payloads as application/x-www-form-urlencoded
// The payhash is over the raw body string excluding the payhash param itself.

function verifySignature(rawBody: string, receivedHash: string): boolean {
  const secret = process.env.PAYREXX_WEBHOOK_SECRET
  if (!secret) {
    console.error("[payrexx webhook] PAYREXX_WEBHOOK_SECRET is not set")
    return false
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(receivedHash, "utf8")
    )
  } catch {
    return false
  }
}

// Payrexx transaction status values
const PAID_STATUSES = new Set(["confirmed", "waiting"])
const FAILED_STATUSES = new Set(["declined", "refunded", "cancelled"])

export async function POST(req: NextRequest) {
  // Read raw body for signature verification
  const rawBody = await req.text()

  const params = new URLSearchParams(rawBody)
  const receivedHash = params.get("payhash") ?? ""

  // Remove payhash from params, then re-encode for verification
  // (Payrexx signs the body WITHOUT the payhash field)
  params.delete("payhash")
  const bodyForVerification = params.toString()

  if (!verifySignature(bodyForVerification, receivedHash)) {
    console.warn("[payrexx webhook] Invalid signature — request rejected")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  // Parse the transaction data
  // Payrexx sends nested params like transaction[id], transaction[status], etc.
  // We extract the keys we care about.
  const transactionId = params.get("transaction[id]") ?? params.get("id")
  const status = params.get("transaction[status]") ?? params.get("status")
  const referenceId = params.get("transaction[referenceId]") ?? params.get("referenceId") // our Subscription.id
  const amount = params.get("transaction[amount]") ?? params.get("amount")
  const currency = params.get("transaction[currency]") ?? params.get("currency") ?? "CHF"

  if (!transactionId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    if (PAID_STATUSES.has(status)) {
      // Payment confirmed — activate subscription
      if (referenceId) {
        await prisma.subscription.update({
          where: { id: referenceId },
          data: {
            status: "ACTIVE",
            payrexxTransactionId: String(transactionId),
            paidAt: new Date(),
            amount: amount ? parseFloat(amount) / 100 : undefined, // Payrexx sends cents
            currency,
          },
        })

        // Also flip the user's subscription status to ACTIVE
        const subscription = await prisma.subscription.findUnique({
          where: { id: referenceId },
          select: { userId: true },
        })
        if (subscription) {
          await prisma.user.update({
            where: { id: subscription.userId },
            data: { subscriptionStatus: "ACTIVE" },
          })
        }
      }
    } else if (FAILED_STATUSES.has(status)) {
      // Payment failed / cancelled
      if (referenceId) {
        await prisma.subscription.update({
          where: { id: referenceId },
          data: {
            status: "CANCELLED",
            payrexxTransactionId: String(transactionId),
          },
        })

        const subscription = await prisma.subscription.findUnique({
          where: { id: referenceId },
          select: { userId: true },
        })
        if (subscription) {
          await prisma.user.update({
            where: { id: subscription.userId },
            data: { subscriptionStatus: "EXPIRED" },
          })
        }
      }
    }
    // Other statuses (e.g. "authorized", "reserved") are no-ops for now

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[payrexx webhook] DB error:", err)
    // Return 500 so Payrexx will retry
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// Payrexx also sends GET pings to verify the endpoint is reachable
export async function GET() {
  return NextResponse.json({ ok: true })
}
