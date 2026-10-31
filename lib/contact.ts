/**
 * Where sales and support email goes. The mailbox must exist in cPanel
 * (Email Accounts) for replies to arrive; change it here to use another one.
 */
export const CONTACT_EMAIL = "hello@replynxt.com";

/** A mailto: link to CONTACT_EMAIL with a subject and starter body. */
export function contactMailto(subject: string, body: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
