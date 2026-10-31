"use server";

import { redirect } from "next/navigation";
import { EMAIL_PROVIDER_ID, signIn } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { authenticateWithPassword } from "@/lib/auth-password/authenticate";
import { safeCallbackPath } from "@/lib/auth-password/callback";
import { startSession } from "@/lib/auth-password/session";

export interface PasswordFormState {
  error: string | null;
}

const messages = {
  invalid: "That email and password don't match. Try again, or sign in with an email link.",
  locked: "Too many tries for this email. Wait 15 minutes, or sign in with an email link.",
  unverified: "Verify your email first: sign in with an email link, then set your password.",
} as const;

/** Signs in with email and password; on success, goes to the callback. */
export async function signInWithPassword(
  _previous: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await authenticateWithPassword(email, password);
  if (!result.ok) return { error: messages[result.reason] };

  await startSession(result.userId);
  redirect(safeCallbackPath(String(formData.get("callbackUrl") ?? "")));
}

/**
 * Emails a sign-in link. Following it is what verifies the address. People
 * without a password yet land on the page to set one, then carry on to where
 * they were going.
 */
export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const callback = safeCallbackPath(String(formData.get("callbackUrl") ?? ""));
  const user = email
    ? await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { passwordHash: true },
      })
    : null;
  const redirectTo = user?.passwordHash
    ? callback
    : `/account/password?next=${encodeURIComponent(callback)}`;
  await signIn(EMAIL_PROVIDER_ID, { email, redirectTo });
}
