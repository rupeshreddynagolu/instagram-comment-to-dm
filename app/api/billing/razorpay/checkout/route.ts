import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireEnv } from "@/lib/env";
import { prisma } from "@/lib/db/client";
import { billingProviderError } from "@/lib/billing/errors";
import { hasPaidAccess } from "@/lib/billing/plans";
import {
  cancelRazorpaySubscription,
  createRazorpaySubscription,
  isRazorpayConfigured,
} from "@/lib/razorpay";
import {
  canManageBilling,
  getCurrentWorkspaceContext,
} from "@/lib/workspace-access";

const checkoutSchema = z.object({
  plan: z.enum(["PRO", "AGENCY"]),
});

export async function POST(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!canManageBilling(context.role)) {
    return NextResponse.json(
      { success: false, error: "Only workspace owners can manage billing" },
      { status: 403 }
    );
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { success: false, error: "Razorpay billing is not configured" },
      { status: 503 }
    );
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid checkout plan" },
      { status: 400 }
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: context.workspaceId },
    select: {
      subscriptionStatus: true,
      razorpaySubscriptionId: true,
    },
  });

  if (!workspace) {
    return NextResponse.json(
      { success: false, error: "Workspace not found" },
      { status: 404 }
    );
  }

  // Switching plans or providers while paid would leave two live
  // subscriptions charging the customer.
  if (hasPaidAccess(workspace.subscriptionStatus)) {
    return NextResponse.json(
      {
        success: false,
        error: "This workspace already has an active subscription. Cancel it first.",
      },
      { status: 409 }
    );
  }

  // A previous checkout that was never completed: cancel it so its payment
  // link cannot be used after this one replaces it.
  if (workspace.razorpaySubscriptionId) {
    await cancelRazorpaySubscription(workspace.razorpaySubscriptionId, {
      atCycleEnd: false,
    }).catch(() => {
      // Already cancelled, completed or expired — nothing to clean up.
    });
  }

  const planId =
    parsed.data.plan === "AGENCY"
      ? requireEnv("RAZORPAY_PLAN_AGENCY")
      : requireEnv("RAZORPAY_PLAN_PRO");

  let subscription;
  try {
    subscription = await createRazorpaySubscription({
      planId,
      notes: {
        workspaceId: context.workspaceId,
        plan: parsed.data.plan,
      },
    });
  } catch (error) {
    return billingProviderError("Razorpay", error);
  }

  await prisma.workspace.update({
    where: { id: context.workspaceId },
    data: {
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: subscription.plan_id,
      cancelAtPeriodEnd: false,
    },
  });

  return NextResponse.json({ success: true, url: subscription.short_url });
}
