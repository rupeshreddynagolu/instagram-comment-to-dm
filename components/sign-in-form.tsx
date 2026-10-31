"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  continueWithEmail,
  sendResetLink,
  signInWithPassword,
  type EmailStepState,
  type PasswordFormState,
} from "@/app/login/actions";
import { CtaChevron, ctaClasses } from "@/components/site/cta-button";

const field =
  "min-h-12 w-full rounded-2xl border border-white/12 bg-black/30 px-4 text-base text-site-paper shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] transition-colors placeholder:text-site-dim/70 focus:border-site-reply focus:outline-none focus:ring-4 focus:ring-site-reply/15";

function ErrorMessage({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="rounded-2xl border border-site-marker/30 bg-site-marker/10 px-4 py-3 text-[15px] leading-6 text-[#ffb59e]"
    >
      {children}
    </p>
  );
}

/**
 * Email first. An account with a password is asked for it, with "Forgot
 * password?" emailing a sign-in link instead; a new email (or an account
 * without a password) is emailed a link that verifies it.
 */
export default function SignInForm({
  callbackUrl,
  linkError,
}: {
  callbackUrl: string;
  /** Auth.js's error from a failed link, shown on the email step. */
  linkError: string | null;
}) {
  const [lookup, lookupAction, lookupPending] = useActionState<EmailStepState, FormData>(continueWithEmail, {
    step: "email",
    email: "",
    error: null,
  });
  const [signIn, signInAction, signInPending] = useActionState<PasswordFormState, FormData>(signInWithPassword, {
    error: null,
  });
  const [reset, resetAction, resetPending] = useActionState<PasswordFormState, FormData>(sendResetLink, {
    error: null,
  });
  // Held here so it survives React resetting the form after each step.
  const [email, setEmail] = useState("");
  // "Use a different email" returns to the first step without a round trip.
  const [editing, setEditing] = useState(false);
  const [shown, setShown] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const askPassword = lookup.step === "password" && !editing;

  useEffect(() => {
    if (askPassword) passwordRef.current?.focus();
  }, [askPassword, lookup]);

  if (askPassword) {
    const error = reset.error ?? signIn.error;
    return (
      <>
        {/* "Forgot password?" submits this one. It's a form of its own so
            pressing Enter in the password field always means Sign in. */}
        <form id="reset-form" action={resetAction} hidden>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <input type="hidden" name="email" value={lookup.email} />
        </form>
        <form action={signInAction} className="space-y-5">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          {/* Hidden, but a real field so password managers pair the two. */}
          <input type="email" name="email" autoComplete="username" value={lookup.email} readOnly hidden />
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <span className="min-w-0 truncate text-[15px] text-site-paper">{lookup.email}</span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 text-[13px] text-site-dim underline-offset-4 hover:text-site-paper hover:underline"
            >
              Change
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="password" className="block text-[15px] font-semibold">
                Password
              </label>
              {/* The email link signs them in and leads to choosing a new password. */}
              <button
                type="submit"
                form="reset-form"
                disabled={resetPending}
                className="text-[13px] text-site-dim underline-offset-4 hover:text-site-paper hover:underline"
              >
                {resetPending ? "Sending link…" : "Forgot password?"}
              </button>
            </div>
            <div className="relative">
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={shown ? "text" : "password"}
                required
                autoComplete="current-password"
                aria-describedby={error ? "password-error" : undefined}
                className={`${field} pr-20`}
              />
              <button
                type="button"
                onClick={() => setShown((value) => !value)}
                aria-pressed={shown}
                className="site-mono absolute inset-y-1.5 right-1.5 rounded-xl px-3 text-[12px] text-site-dim transition-colors hover:bg-white/5 hover:text-site-paper"
              >
                {shown ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <ErrorMessage id="password-error">{error}</ErrorMessage>}

          <button type="submit" disabled={signInPending} className={ctaClasses({ className: "flex w-full" })}>
            <span>{signInPending ? "Signing in…" : "Sign in"}</span>
            <CtaChevron />
          </button>
        </form>
      </>
    );
  }

  const error = lookup.error ?? linkError;
  return (
    <form action={lookupAction} onSubmit={() => setEditing(false)} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-2">
        <label htmlFor="email" className="block text-[15px] font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={error ? "email-error" : undefined}
          className={field}
        />
      </div>

      {error && <ErrorMessage id="email-error">{error}</ErrorMessage>}

      <button type="submit" disabled={lookupPending} className={ctaClasses({ className: "flex w-full" })}>
        <span>{lookupPending ? "Checking…" : "Continue"}</span>
        <CtaChevron />
      </button>
    </form>
  );
}
