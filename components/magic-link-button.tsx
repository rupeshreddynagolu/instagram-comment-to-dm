"use client";

import { useFormStatus } from "react-dom";
import { CtaChevron, ctaClasses } from "@/components/site/cta-button";

/**
 * The login form's submit button. Sending the email takes a few seconds, so
 * it says so and refuses a second click until the form's action finishes.
 */
export default function MagicLinkButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={ctaClasses({ className: "flex w-full" })}
    >
      <span className="inline-flex items-center gap-2">
        {pending && (
          <svg
            className="h-4 w-4 animate-spin motion-reduce:animate-none"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="2.5"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )}
        {pending ? "Sending link…" : "Email me a magic link"}
      </span>
      <CtaChevron />
    </button>
  );
}
