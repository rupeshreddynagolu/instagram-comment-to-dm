"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EMAIL_PROVIDER_ID, signIn } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { authenticateWithPassword } from "@/lib/auth-password/authenticate";
import { safeCallbackPath } from "@/lib/auth-password/callback";
import { startSession } from "@/lib/auth-password/session";
import { clientKey, plainEmail, take } from "@/lib/auth-password/throttle";

const WINDOW_MS = 15 * 60 * 1000;
const tooManyTries = "Too many tries. Wait a few minutes and try again.";

export interface PasswordFormState {
  error: string | null;
}

const messages = {
  invalid: "That password isn't right. Try again, or use \"Forgot password?\" to get an email link.",
  locked: "Too many tries. Wait 15 minutes, or use \"Forgot password?\" to get an email link.",
  unverified: "Verify your email first: use \"Forgot password?\" and follow the link we send.",
} as const;

export interface EmailStepState {
  /** "password" once the email belongs to an account with a password. */
  step: "email" | "password";
  email: string;
  error: string | null;
}

/**
 * The first step of signing in: the email alone. An account with a password
 * goes on to the password step; anyone else (a new email, or an account that
 * never set a password) is emailed a link, which verifies the address,
 * creates the account if needed, and leads to setting a password.
 */
export async function continueWithEmail(
  _previous: EmailStepState,
  formData: FormData
): Promise<EmailStepState> {
  const typed = String(formData.get("email") ?? "").trim();
  const email = plainEmail(typed);
  if (!email) return { step: "email", email: typed, error: "Enter an email address like you@company.com." };
  // This step says whether an account exists, so a client only gets so many.
  if (!take(`lookup:${clientKey(await headers())}`, 30, WINDOW_MS)) {
    return { step: "email", email, error: tooManyTries };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { passwordHash: true },
  });
  if (user?.passwordHash) return { step: "password", email, error: null };

  return { step: "email", email, error: await emailSignInLink(formData, false) };
}

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

const sendFailed = "We couldn't send an email to that address. Check it and try again.";

/**
 * Emails a sign-in link, then shows "Check your email"; returns an error
 * instead if the email couldn't be sent. Following the link is what verifies
 * the address (and creates the account for a new one). People without a
 * password yet, or resetting a forgotten one, land on the page to set one,
 * then carry on to where they were going.
 */
async function emailSignInLink(formData: FormData, resetting: boolean): Promise<string> {
  const email = plainEmail(String(formData.get("email") ?? ""));
  if (!email) return "Enter an email address like you@company.com.";
  // A few links per client across addresses, then a few per address so
  // nobody can flood someone else's inbox. The client's own budget goes
  // first, so using up someone else's address costs the sender too.
  if (!take(`link-${clientKey(await headers())}`, 10, WINDOW_MS)) return tooManyTries;
  if (!take(`link:${email}`, 3, WINDOW_MS)) {
    return "We've already sent links to this email. Check your inbox and spam, or wait 15 minutes.";
  }
  const callback = safeCallbackPath(String(formData.get("callbackUrl") ?? ""));
  const user = await prisma.user.findUnique({ where: { email }, select: { passwordHash: true } });
  const redirectTo = user?.passwordHash && !resetting
    ? callback
    : `/account/password?next=${encodeURIComponent(callback)}`;

  // Without redirecting, Auth.js hands back where it would have gone: an
  // error URL when the mail server refused the address.
  const next = await signIn(EMAIL_PROVIDER_ID, { email, redirectTo, redirect: false });
  if (new URL(next, "http://localhost").searchParams.has("error")) return sendFailed;
  redirect(next);
}

/** "Forgot password?": an email link that leads to choosing a new password. */
export async function sendResetLink(
  _previous: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  return { error: await emailSignInLink(formData, true) };
}
