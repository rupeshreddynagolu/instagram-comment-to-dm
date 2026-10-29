/**
 * Billing routes — Unit Tests
 *
 * Provider failures must reach the settings page as a readable JSON error,
 * and checkout must refuse to start a second subscription for a paying
 * workspace.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockPrisma,
  mockAuth,
  mockContext,
  mockCreateRazorpaySubscription,
  mockCancelRazorpaySubscription,
  mockStripe,
} = vi.hoisted(() => ({
  mockPrisma: {
    workspace: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
  mockAuth: vi.fn(),
  mockContext: vi.fn(),
  mockCreateRazorpaySubscription: vi.fn(),
  mockCancelRazorpaySubscription: vi.fn(),
  mockStripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
  },
}));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/stripe", () => ({ getStripe: () => mockStripe }));
vi.mock("@/lib/workspace-access", () => ({
  getCurrentWorkspaceContext: mockContext,
  canManageBilling: (role: string) => role === "OWNER",
}));
vi.mock("@/lib/razorpay", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/razorpay")>();
  return {
    ...actual,
    createRazorpaySubscription: mockCreateRazorpaySubscription,
    cancelRazorpaySubscription: mockCancelRazorpaySubscription,
  };
});

import { billingProviderError } from "../lib/billing/errors";
import { RazorpayApiError } from "../lib/razorpay";
import { POST as razorpayCheckout } from "../app/api/billing/razorpay/checkout/route";
import { POST as razorpayCancel } from "../app/api/billing/razorpay/cancel/route";
import { POST as stripeCheckout } from "../app/api/billing/checkout/route";

function jsonRequest(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  for (const [name, value] of Object.entries({
    RAZORPAY_KEY_ID: "rzp_test_key",
    RAZORPAY_KEY_SECRET: "secret",
    RAZORPAY_WEBHOOK_SECRET: "whsec",
    RAZORPAY_PLAN_PRO: "plan_pro",
    RAZORPAY_PLAN_AGENCY: "plan_agency",
    STRIPE_PRICE_PRO: "price_pro",
    STRIPE_PRICE_AGENCY: "price_agency",
  })) {
    vi.stubEnv(name, value);
  }
  mockAuth.mockResolvedValue({ user: { email: "owner@example.com" } });
  mockContext.mockResolvedValue({ workspaceId: "ws_1", role: "OWNER" });
  mockPrisma.workspace.update.mockResolvedValue({});
  mockPrisma.workspace.updateMany.mockResolvedValue({ count: 1 });
});

describe("billingProviderError", () => {
  it("answers 502 with a readable message for each kind of failure", async () => {
    const limited = billingProviderError(
      "Razorpay",
      new RazorpayApiError(429, "Too many requests")
    );
    expect(limited.status).toBe(502);
    expect((await limited.json()).error).toMatch(/limiting requests/);

    const badKey = billingProviderError(
      "Stripe",
      Object.assign(new Error("Invalid API Key provided"), { statusCode: 401 })
    );
    expect((await badKey.json()).error).toMatch(/rejected the API key/);

    const other = billingProviderError("Stripe", new Error("Price not found"));
    expect((await other.json()).error).toBe(
      "Stripe could not complete the request: Price not found"
    );
  });
});

describe("POST /api/billing/razorpay/checkout", () => {
  it("returns a JSON error instead of crashing when Razorpay rate-limits", async () => {
    mockPrisma.workspace.findUnique.mockResolvedValue({
      subscriptionStatus: "NONE",
      razorpaySubscriptionId: null,
    });
    mockCreateRazorpaySubscription.mockRejectedValue(
      new RazorpayApiError(429, "Too many requests")
    );

    const res = await razorpayCheckout(
      jsonRequest("http://localhost/api/billing/razorpay/checkout", { plan: "PRO" })
    );

    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/Razorpay is limiting requests/);
    expect(mockPrisma.workspace.update).not.toHaveBeenCalled();
  });

  it("clears a stale pending cancellation when a new subscription starts", async () => {
    mockPrisma.workspace.findUnique.mockResolvedValue({
      subscriptionStatus: "CANCELED",
      razorpaySubscriptionId: null,
    });
    mockCreateRazorpaySubscription.mockResolvedValue({
      id: "sub_new",
      plan_id: "plan_pro",
      short_url: "https://rzp.io/i/abc",
    });

    const res = await razorpayCheckout(
      jsonRequest("http://localhost/api/billing/razorpay/checkout", { plan: "PRO" })
    );

    expect(await res.json()).toEqual({ success: true, url: "https://rzp.io/i/abc" });
    expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
      where: { id: "ws_1" },
      data: {
        razorpaySubscriptionId: "sub_new",
        razorpayPlanId: "plan_pro",
        cancelAtPeriodEnd: false,
      },
    });
  });
});

describe("POST /api/billing/razorpay/cancel", () => {
  it("records the pending cancellation, since Razorpay keeps the subscription active", async () => {
    mockPrisma.workspace.findUnique.mockResolvedValue({
      billingProvider: "RAZORPAY",
      razorpaySubscriptionId: "sub_1",
    });
    mockCancelRazorpaySubscription.mockResolvedValue({
      id: "sub_1",
      plan_id: "plan_pro",
      customer_id: null,
      status: "active",
      current_end: 1_800_000_000,
      short_url: null,
      notes: [],
    });

    const res = await razorpayCancel();

    expect(res.status).toBe(200);
    expect(mockCancelRazorpaySubscription).toHaveBeenCalledWith("sub_1", {
      atCycleEnd: true,
    });
    expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
      where: { id: "ws_1" },
      data: { cancelAtPeriodEnd: true },
    });
  });

  it("returns a JSON error when Razorpay refuses the cancellation", async () => {
    mockPrisma.workspace.findUnique.mockResolvedValue({
      billingProvider: "RAZORPAY",
      razorpaySubscriptionId: "sub_1",
    });
    mockCancelRazorpaySubscription.mockRejectedValue(
      new RazorpayApiError(400, "Subscription is not cancellable")
    );

    const res = await razorpayCancel();

    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/Subscription is not cancellable/);
    expect(mockPrisma.workspace.update).not.toHaveBeenCalled();
  });
});

describe("POST /api/billing/checkout (Stripe)", () => {
  it("refuses a second checkout for a workspace already paying through Stripe", async () => {
    mockPrisma.workspace.findUnique.mockResolvedValue({
      name: "ws",
      stripeCustomerId: "cus_1",
      billingProvider: "STRIPE",
      subscriptionStatus: "ACTIVE",
    });

    const res = await stripeCheckout(
      jsonRequest("http://localhost/api/billing/checkout", { plan: "AGENCY" })
    );

    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/Billing Portal/);
    expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("returns a JSON error instead of crashing when Stripe rejects the key", async () => {
    mockPrisma.workspace.findUnique.mockResolvedValue({
      name: "ws",
      stripeCustomerId: "cus_1",
      billingProvider: "STRIPE",
      subscriptionStatus: "NONE",
    });
    mockStripe.checkout.sessions.create.mockRejectedValue(
      Object.assign(new Error("Invalid API Key provided: sk_test_..."), {
        statusCode: 401,
      })
    );

    const res = await stripeCheckout(
      jsonRequest("http://localhost/api/billing/checkout", { plan: "PRO" })
    );

    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/Stripe rejected the API key/);
  });
});
