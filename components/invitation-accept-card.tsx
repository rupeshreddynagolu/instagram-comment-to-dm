"use client";

import { useState } from "react";
import { CtaChevron, ctaClasses } from "@/components/site/cta-button";

interface InvitationAcceptCardProps {
  token: string;
  isSignedIn: boolean;
  invitedEmail: string;
}

export default function InvitationAcceptCard({
  token,
  isSignedIn,
  invitedEmail,
}: InvitationAcceptCardProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function acceptInvite() {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/workspace/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const payload = await response.json();
    if (payload.success) {
      window.location.assign("/dashboard");
      return;
    }
    setMessage(payload.error ?? "Could not accept invitation");
    setBusy(false);
  }

  if (!isSignedIn) {
    return (
      <a href="/login" className={ctaClasses({})}>
        <span>Sign in to accept</span>
        <CtaChevron />
      </a>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={acceptInvite}
        disabled={busy}
        className={ctaClasses({})}
      >
        <span>{busy ? "Accepting..." : "Accept invitation"}</span>
        <CtaChevron />
      </button>
      {message && <p className="text-sm text-error">{message}</p>}
      <p className="text-sm text-site-dim">
        Use the magic link account for {invitedEmail}.
      </p>
    </div>
  );
}

