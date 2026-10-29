import { NextResponse } from "next/server";

type BillingProviderName = "Stripe" | "Razorpay";

function providerStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  // RazorpayApiError carries `status`; Stripe's errors carry `statusCode`.
  const { status, statusCode } = error as {
    status?: unknown;
    statusCode?: unknown;
  };
  if (typeof status === "number") return status;
  if (typeof statusCode === "number") return statusCode;
  return undefined;
}

/**
 * Turn a failed call to a payment provider into a JSON error the billing UI
 * can show. Without this the route throws, Next answers with an empty 500,
 * and the page has nothing to tell the owner.
 */
export function billingProviderError(
  provider: BillingProviderName,
  error: unknown
) {
  console.error(`[Billing] ${provider} request failed:`, error);

  const status = providerStatus(error);
  const message =
    status === 429
      ? `${provider} is limiting requests right now. Try again in a minute.`
      : status === 401
        ? `${provider} rejected the API key. Check the ${provider} settings in the environment.`
        : `${provider} could not complete the request: ${
            error instanceof Error ? error.message : "unknown error"
          }`;

  return NextResponse.json({ success: false, error: message }, { status: 502 });
}
