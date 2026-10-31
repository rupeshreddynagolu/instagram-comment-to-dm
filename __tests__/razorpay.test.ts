/**
 * Razorpay billing — Unit Tests
 *
 * Tests webhook signature verification, status and plan mapping, the
 * one-provider-at-a-time guard, and the webhook route's sync flow.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";

const { mockPrisma, mockFetchSubscription } = vi.hoisted(() => ({
  mockPrisma: {
    workspace: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
    },
    billingEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  mockFetchSubscription: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));

vi.mock("@/lib/razorpay", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/razorpay")>();
  return { ...actual, fetchRazorpaySubscription: mockFetchSubscription };
});

import { verifyRazorpayWebhookSignature } from "../lib/razorpay";
import { getPlanForRazorpayPlanId } from "../lib/billing/plans";
import {
  mapRazorpayStatus,
  ownedByOrUnpaid,
  syncRazorpaySubscription,
} from "../lib/billing/providers";
import { POST as razorpayWebhook } from "../app/api/razorpay/webhook/route";

const WEBHOOK_SECRET = "rzp_webhook_secret_test";

function sign(body: string, secret = WEBHOOK_SECRET) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

const activeSubscription = {
  id: "sub_123",
  plan_id: "plan_pro",
  customer_id: "cust_1",
  status: "active" as const,
  current_end: 1_800_000_000,
  short_url: null,
  notes: { workspaceId: "ws_1" },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", WEBHOOK_SECRET);
  vi.stubEnv("RAZORPAY_PLAN_PRO", "plan_pro");
  vi.stubEnv("RAZORPAY_PLAN_AGENCY", "plan_agency");
  vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_key");
  vi.stubEnv("RAZORPAY_KEY_SECRET", "rzp_test_secret");
  mockPrisma.workspace.updateMany.mockResolvedValue({ count: 1 });
  mockPrisma.workspace.findUnique.mockResolvedValue({ id: "ws_1" });
  mockPrisma.billingEvent.findUnique.mockResolvedValue(null);
  mockPrisma.billingEvent.create.mockResolvedValue({});
  mockFetchSubscription.mockResolvedValue(activeSubscription);
});

describe("verifyRazorpayWebhookSignature", () => {
  it("accepts a hex HMAC-SHA256 of the raw body", () => {
    const body = '{"event":"subscription.activated"}';
    expect(verifyRazorpayWebhookSignature(body, sign(body))).toBe(true);
  });

  it("rejects a missing, wrong-secret or tampered signature", () => {
    const body = '{"event":"subscription.activated"}';
    expect(verifyRazorpayWebhookSignature(body, null)).toBe(false);
    expect(verifyRazorpayWebhookSignature(body, sign(body, "other"))).toBe(false);
    expect(
      verifyRazorpayWebhookSignature('{"event":"tampered"}', sign(body))
    ).toBe(false);
  });
});

describe("Razorpay mapping", () => {
  it("grants access only to active subscriptions", () => {
    expect(mapRazorpayStatus("active")).toBe("ACTIVE");
    expect(mapRazorpayStatus("created")).toBe("NONE");
    expect(mapRazorpayStatus("authenticated")).toBe("NONE");
    expect(mapRazorpayStatus("pending")).toBe("PAST_DUE");
    expect(mapRazorpayStatus("halted")).toBe("UNPAID");
    expect(mapRazorpayStatus("paused")).toBe("UNPAID");
    expect(mapRazorpayStatus("cancelled")).toBe("CANCELED");
    expect(mapRazorpayStatus("completed")).toBe("CANCELED");
  });

  it("maps Razorpay plan IDs to plans", () => {
    expect(getPlanForRazorpayPlanId("plan_pro")).toBe("PRO");
    expect(getPlanForRazorpayPlanId("plan_agency")).toBe("AGENCY");
    expect(getPlanForRazorpayPlanId("plan_unknown")).toBe("FREE");
    expect(getPlanForRazorpayPlanId(null)).toBe("FREE");
  });

  it("maps yearly Razorpay plan IDs to the same plans", () => {
    vi.stubEnv("RAZORPAY_PLAN_PRO_YEARLY", "plan_pro_yearly");
    vi.stubEnv("RAZORPAY_PLAN_AGENCY_YEARLY", "plan_agency_yearly");
    expect(getPlanForRazorpayPlanId("plan_pro_yearly")).toBe("PRO");
    expect(getPlanForRazorpayPlanId("plan_agency_yearly")).toBe("AGENCY");
  });

  it("still recognises plans that were replaced, so existing subscribers keep access", () => {
    vi.stubEnv("RAZORPAY_PLAN_PRO_PREVIOUS", "plan_old_pro, plan_older_pro");
    vi.stubEnv("RAZORPAY_PLAN_AGENCY_PREVIOUS", "plan_old_agency");
    expect(getPlanForRazorpayPlanId("plan_old_pro")).toBe("PRO");
    expect(getPlanForRazorpayPlanId("plan_older_pro")).toBe("PRO");
    expect(getPlanForRazorpayPlanId("plan_old_agency")).toBe("AGENCY");
  });

  it("never matches an unset yearly plan against an empty plan ID", () => {
    vi.stubEnv("RAZORPAY_PLAN_PRO_YEARLY", "");
    expect(getPlanForRazorpayPlanId("")).toBe("FREE");
  });
});

describe("syncRazorpaySubscription", () => {
  it("updates only the workspace that owns the subscription, guarded by provider", async () => {
    await syncRazorpaySubscription(activeSubscription);

    const call = mockPrisma.workspace.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({
      razorpaySubscriptionId: "sub_123",
      ...ownedByOrUnpaid("RAZORPAY"),
    });
    expect(call.data).toMatchObject({
      billingProvider: "RAZORPAY",
      plan: "PRO",
      subscriptionStatus: "ACTIVE",
      razorpayCustomerId: "cust_1",
      currentPeriodEnd: new Date(1_800_000_000 * 1000),
    });
  });

  it("never lets one provider override a workspace the other is billing", () => {
    expect(ownedByOrUnpaid("RAZORPAY")).toEqual({
      OR: [
        { billingProvider: "RAZORPAY" },
        { subscriptionStatus: { notIn: ["ACTIVE", "TRIALING"] } },
      ],
    });
  });
});

describe("POST /api/razorpay/webhook", () => {
  function webhookRequest(body: string, headers: Record<string, string>) {
    return new NextRequest("http://localhost/api/razorpay/webhook", {
      method: "POST",
      body,
      headers,
    });
  }

  const body = JSON.stringify({
    event: "subscription.charged",
    payload: { subscription: { entity: { ...activeSubscription, status: "pending" } } },
  });

  it("answers 503 when Razorpay is not configured", async () => {
    vi.stubEnv("RAZORPAY_KEY_ID", "");
    const res = await razorpayWebhook(webhookRequest(body, {}));
    expect(res.status).toBe(503);
  });

  it("rejects an invalid signature without touching the database", async () => {
    const res = await razorpayWebhook(
      webhookRequest(body, {
        "x-razorpay-signature": "bad",
        "x-razorpay-event-id": "evt_1",
      })
    );
    expect(res.status).toBe(400);
    expect(mockPrisma.workspace.updateMany).not.toHaveBeenCalled();
  });

  it("syncs from the API's current state, not the event's snapshot", async () => {
    const res = await razorpayWebhook(
      webhookRequest(body, {
        "x-razorpay-signature": sign(body),
        "x-razorpay-event-id": "evt_1",
      })
    );

    expect(res.status).toBe(200);
    expect(mockFetchSubscription).toHaveBeenCalledWith("sub_123");
    // The event said "pending"; the API says "active", which wins.
    expect(mockPrisma.workspace.updateMany.mock.calls[0][0].data.subscriptionStatus).toBe(
      "ACTIVE"
    );
    expect(mockPrisma.billingEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        provider: "RAZORPAY",
        eventId: "evt_1",
        type: "subscription.charged",
        workspaceId: "ws_1",
      }),
    });
  });

  it("skips an event it has already recorded", async () => {
    mockPrisma.billingEvent.findUnique.mockResolvedValue({ id: "be_1" });

    const res = await razorpayWebhook(
      webhookRequest(body, {
        "x-razorpay-signature": sign(body),
        "x-razorpay-event-id": "evt_1",
      })
    );

    expect(await res.json()).toEqual({ received: true, duplicate: true });
    expect(mockFetchSubscription).not.toHaveBeenCalled();
  });
});
