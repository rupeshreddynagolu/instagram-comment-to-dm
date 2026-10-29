import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@/app/generated/prisma/client";
import { syncRazorpaySubscription } from "@/lib/billing/providers";
import {
  fetchRazorpaySubscription,
  isRazorpayConfigured,
  verifyRazorpayWebhookSignature,
  type RazorpaySubscription,
} from "@/lib/razorpay";

interface RazorpayWebhookEvent {
  event: string;
  payload?: {
    subscription?: { entity?: RazorpaySubscription };
  };
}

export async function POST(request: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { success: false, error: "Razorpay billing is not configured" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();

  if (
    !verifyRazorpayWebhookSignature(
      rawBody,
      request.headers.get("x-razorpay-signature")
    )
  ) {
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  const eventId = request.headers.get("x-razorpay-event-id");
  if (!eventId) {
    return NextResponse.json(
      { success: false, error: "Missing event id" },
      { status: 400 }
    );
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const existing = await prisma.billingEvent.findUnique({
    where: { provider_eventId: { provider: "RAZORPAY", eventId } },
  });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const entity = event.payload?.subscription?.entity;
  let workspaceId: string | null = null;

  if (event.event.startsWith("subscription.") && entity?.id) {
    // Razorpay can deliver events out of order (a late "charged" after
    // "cancelled"), so the event only says which subscription changed. Its
    // current state comes from the API.
    const subscription = await fetchRazorpaySubscription(entity.id);
    await syncRazorpaySubscription(subscription);

    const workspace = await prisma.workspace.findUnique({
      where: { razorpaySubscriptionId: subscription.id },
      select: { id: true },
    });
    workspaceId = workspace?.id ?? null;
  }

  try {
    await prisma.billingEvent.create({
      data: {
        workspaceId,
        provider: "RAZORPAY",
        eventId,
        type: event.event,
        payload: event as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    // A concurrent redelivery recorded it first; the sync above is idempotent.
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error;
    }
  }

  return NextResponse.json({ received: true });
}
