import { createHmac, timingSafeEqual } from "crypto";
import { requireEnv } from "@/lib/env";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

// Billing cycles a subscription runs for. Razorpay requires a finite count;
// ten years is effectively "until cancelled", in months or in years.
export const SUBSCRIPTION_TOTAL_COUNT = { MONTHLY: 120, YEARLY: 10 } as const;

export type RazorpaySubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired"
  | "paused";

export interface RazorpaySubscription {
  id: string;
  plan_id: string;
  customer_id: string | null;
  status: RazorpaySubscriptionStatus;
  current_end: number | null;
  short_url: string | null;
  // Razorpay sends an empty array instead of an object when there are no notes.
  notes: Record<string, string> | [];
}

export class RazorpayApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "RazorpayApiError";
  }
}

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_WEBHOOK_SECRET &&
      process.env.RAZORPAY_PLAN_PRO &&
      process.env.RAZORPAY_PLAN_AGENCY
  );
}

/** Yearly billing needs its own Razorpay plan for each paid tier. */
export function isRazorpayYearlyConfigured(): boolean {
  return Boolean(
    isRazorpayConfigured() &&
      process.env.RAZORPAY_PLAN_PRO_YEARLY &&
      process.env.RAZORPAY_PLAN_AGENCY_YEARLY
  );
}

async function razorpayRequest<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown }
): Promise<T> {
  const credentials = Buffer.from(
    `${requireEnv("RAZORPAY_KEY_ID")}:${requireEnv("RAZORPAY_KEY_SECRET")}`
  ).toString("base64");

  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const description =
      data?.error?.description ?? `Razorpay request failed (${response.status})`;
    throw new RazorpayApiError(response.status, description);
  }

  return data as T;
}

export function createRazorpaySubscription(input: {
  planId: string;
  totalCount: number;
  notes: Record<string, string>;
}): Promise<RazorpaySubscription> {
  return razorpayRequest<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: {
      plan_id: input.planId,
      total_count: input.totalCount,
      customer_notify: true,
      notes: input.notes,
    },
  });
}

export function fetchRazorpaySubscription(
  subscriptionId: string
): Promise<RazorpaySubscription> {
  return razorpayRequest<RazorpaySubscription>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { method: "GET" }
  );
}

export function cancelRazorpaySubscription(
  subscriptionId: string,
  { atCycleEnd }: { atCycleEnd: boolean }
): Promise<RazorpaySubscription> {
  return razorpayRequest<RazorpaySubscription>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
    { method: "POST", body: { cancel_at_cycle_end: atCycleEnd ? 1 : 0 } }
  );
}

/**
 * Razorpay signs the raw request body with HMAC-SHA256 using the webhook
 * secret, hex-encoded, in the X-Razorpay-Signature header. The body must be
 * verified exactly as received, before any JSON parsing.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const expected = createHmac("sha256", requireEnv("RAZORPAY_WEBHOOK_SECRET"))
    .update(rawBody)
    .digest("hex");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    signatureBuffer.length === expectedBuffer.length &&
    timingSafeEqual(signatureBuffer, expectedBuffer)
  );
}
