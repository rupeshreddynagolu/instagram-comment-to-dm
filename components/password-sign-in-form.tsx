"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signInWithPassword, type PasswordFormState } from "@/app/login/actions";
import { CtaChevron, ctaClasses } from "@/components/site/cta-button";

const field =
  "min-h-12 w-full rounded-2xl border border-white/12 bg-black/30 px-4 text-base text-site-paper shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] transition-colors placeholder:text-site-dim/70 focus:border-site-reply focus:outline-none focus:ring-4 focus:ring-site-reply/15";

/** Email and password sign-in, with a show/hide toggle and a link fallback. */
export default function PasswordSignInForm({
  callbackUrl,
  forgotHref,
}: {
  callbackUrl: string;
  forgotHref: string;
}) {
  const [state, action, pending] = useActionState<PasswordFormState, FormData>(signInWithPassword, {
    error: null,
  });
  const [shown, setShown] = useState(false);

  return (
    <form action={action} className="space-y-5">
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
          className={field}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="password" className="block text-[15px] font-semibold">
            Password
          </label>
          <Link href={forgotHref} className="text-[13px] text-site-dim underline-offset-4 hover:text-site-paper hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={shown ? "text" : "password"}
            required
            autoComplete="current-password"
            aria-describedby={state.error ? "password-error" : undefined}
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

      {state.error && (
        <p
          id="password-error"
          role="alert"
          className="rounded-2xl border border-site-marker/30 bg-site-marker/10 px-4 py-3 text-[15px] leading-6 text-[#ffb59e]"
        >
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={ctaClasses({ className: "flex w-full" })}>
        <span>{pending ? "Signing in…" : "Sign in"}</span>
        <CtaChevron />
      </button>
    </form>
  );
}
