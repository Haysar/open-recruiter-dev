/**
 * Payrexx payment gateway client.
 *
 * Creates a payment gateway (hosted payment page) and returns its URL.
 * Docs: https://developers.payrexx.com/docs/gateway
 *
 * Required env vars:
 *   PAYREXX_INSTANCE_NAME — your Payrexx instance slug (e.g. "openrecruiter")
 *   PAYREXX_API_KEY       — your Payrexx API key
 */

import { createHmac } from "crypto"

const BASE_URL = "https://api.payrexx.com/v1.0"

// Payrexx expects the signature as HMAC-SHA256 of the query string using the API key
function sign(params: Record<string, string>, apiKey: string): string {
  const qs = new URLSearchParams(params).toString()
  return createHmac("sha256", apiKey).update(qs).digest("base64")
}

export interface CreateGatewayOptions {
  amount: number          // in CHF (e.g. 9.90)
  subscriptionId: string  // our internal Subscription.id — used as referenceId
  customerEmail?: string
  returnUrl: string       // where to redirect on success
  cancelUrl: string       // where to redirect on cancel
}

export interface PayrexxGateway {
  id: number
  link: string  // The hosted payment page URL to redirect the customer to
}

export async function createPayrexxGateway(opts: CreateGatewayOptions): Promise<PayrexxGateway> {
  const instance = process.env.PAYREXX_INSTANCE_NAME
  const apiKey = process.env.PAYREXX_API_KEY

  if (!instance || !apiKey) {
    throw new Error("PAYREXX_INSTANCE_NAME and PAYREXX_API_KEY must be set")
  }

  // Payrexx amount is in the smallest currency unit (Rappen/cents)
  const amountRappen = Math.round(opts.amount * 100)

  const params: Record<string, string> = {
    amount: String(amountRappen),
    currency: "CHF",
    referenceId: opts.subscriptionId,
    successRedirectUrl: opts.returnUrl,
    failedRedirectUrl: opts.cancelUrl,
    cancelRedirectUrl: opts.cancelUrl,
    preAuthorization: "0",
    reservation: "0",
    "purpose[1]": "Open-Recruiter subscription",
    "fields[email][value]": opts.customerEmail ?? "",
    "fields[email][mandatory]": "1",
    instance,
    ApiSignature: sign({ amount: String(amountRappen), currency: "CHF", referenceId: opts.subscriptionId }, apiKey),
  }

  const body = new URLSearchParams(params)
  const res = await fetch(`${BASE_URL}/Gateway/?instance=${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Payrexx API error ${res.status}: ${text}`)
  }

  const data = await res.json() as {
    status: string
    data: { id: number; link: string }[]
  }

  if (data.status !== "success" || !data.data?.[0]) {
    throw new Error(`Payrexx gateway creation failed: ${JSON.stringify(data)}`)
  }

  return data.data[0]
}
