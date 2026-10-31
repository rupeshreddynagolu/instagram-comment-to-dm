import Link from "next/link";
import MagicLinkButton from "@/components/magic-link-button";
import PasswordSignInForm from "@/components/password-sign-in-form";
import { sendMagicLink } from "@/app/login/actions";
import SiteShell from "@/components/site-shell";
import { GlassCard } from "@/components/site/primitives";
import Reveal from "@/components/site/reveal";
import SplitHeadline from "@/components/site/split-headline";
import { isCheckEmailRedirect } from "@/lib/login/check-email";
import { getCampaignTemplate } from "@/lib/templates/campaign-templates";

export const metadata = {
  title: "Login - ReplyNxt",
  description: "Sign in to manage Instagram comment-to-DM campaigns.",
};

// What happens after signing in, in order.
const steps = [
  { title: "Sign in with your email", body: "We send a one-time link. No password to remember." },
  { title: "Connect Instagram", body: "Link your Instagram professional account through Meta." },
  { title: "Pick a post and go live", body: "Choose the keywords and the reply. ReplyNxt handles the rest." },
];

function MailIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 6.5h17v11h-17v-11Zm0 0 8.5 6.5 8.5-6.5" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkEmail?: string;
    type?: string;
    error?: string;
    callbackUrl?: string;
    template?: string;
    /** "link" shows the email-link form instead of the password one. */
    method?: string;
    /** Why the link form is shown: "signup" or "forgot" change its wording. */
    reason?: string;
  }>;
}) {
  const params = await searchParams;
  const checkEmail = isCheckEmailRedirect(params);
  const selectedTemplate = getCampaignTemplate(params.template);
  const templateCallbackUrl = selectedTemplate
    ? `/campaigns/new?template=${selectedTemplate.slug}`
    : null;
  const callbackUrl = params.callbackUrl ?? templateCallbackUrl ?? "/dashboard";

  const useLink = params.method === "link" || Boolean(params.error);
  const reason = params.reason === "signup" || params.reason === "forgot" ? params.reason : null;

  // Links between the two forms keep where the visitor was heading.
  const keep = new URLSearchParams();
  if (params.callbackUrl) keep.set("callbackUrl", params.callbackUrl);
  if (params.template) keep.set("template", params.template);
  const href = (extra: Record<string, string>) => {
    const query = new URLSearchParams(keep);
    for (const [key, value] of Object.entries(extra)) query.set(key, value);
    const text = query.toString();
    return text ? `/login?${text}` : "/login";
  };

  const linkCopy = {
    signup: {
      title: "Create your account",
      body: "Enter your email and we'll send a link to verify it. Then you'll set a password.",
    },
    forgot: {
      title: "Reset your password",
      body: "We'll email you a sign-in link. Follow it, then choose a new password.",
    },
    default: {
      title: "Sign in with an email link",
      body: "No password needed. We'll email you a secure link that signs you in.",
    },
  }[reason ?? "default"];

  return (
    <SiteShell footer={false}>
      {/* The beam behind the page, as on the home page's opening. */}
      <div
        aria-hidden="true"
        className="beam-hero pointer-events-none absolute inset-x-0 top-0 -z-10 h-[120dvh]"
      />

      <div className="mx-auto grid min-h-[calc(100dvh-7rem)] w-full max-w-6xl items-center gap-10 px-4 pb-16 pt-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* What you're signing in to, and what comes next. */}
        <div>
          <Reveal onLoadDelay={0}>
            <p className="site-mono text-[13px] text-site-paper">
              {selectedTemplate ? "Template selected" : "Sign in or create your account"}
            </p>
          </Reveal>
          <SplitHeadline
            as="h1"
            onLoad
            className="mt-4 max-w-[12em] text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02]"
          >
            {selectedTemplate
              ? `Sign in to use the ${selectedTemplate.title} template`
              : "Your next comment deserves the right reply"}
          </SplitHeadline>

          {selectedTemplate ? (
            <Reveal onLoadDelay={0.4}>
              <p className="mt-6 max-w-lg text-lg leading-8 text-site-paper/85">{selectedTemplate.summary}</p>
              <p className="mt-5 flex flex-wrap gap-1.5" aria-label="Keywords">
                {selectedTemplate.keywords.map((keyword) => (
                  <mark key={keyword} className="marker text-[14px]">
                    {keyword}
                  </mark>
                ))}
              </p>
            </Reveal>
          ) : (
            <Reveal onLoadDelay={0.4} as="ol" className="mt-10 hidden max-w-lg space-y-6 lg:block">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="site-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-[13px] text-site-paper">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{step.title}</p>
                    <p className="mt-0.5 text-[15px] leading-6 text-site-dim">{step.body}</p>
                  </div>
                </li>
              ))}
            </Reveal>
          )}
        </div>

        {/* The form, or the "check your email" state after sending. */}
        <Reveal onLoadDelay={0.3}>
          <GlassCard className="w-full p-6 sm:p-9 lg:max-w-md lg:justify-self-end">
            {checkEmail ? (
              <div role="status">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-site-reply/15 text-site-reply">
                  <MailIcon />
                </span>
                <h2 className="mt-6 text-3xl leading-tight">Check your email</h2>
                <p className="mt-3 text-base leading-7 text-site-dim">
                  We sent you a secure sign-in link. Open it on this device to continue; if you
                  haven&apos;t set a password yet, you&apos;ll choose one next. The link works once and
                  expires after 24 hours.
                </p>
                <p className="mt-6 text-[15px] text-site-dim">
                  Nothing arrived? Check spam, or{" "}
                  <Link href="/login?method=link" className="font-semibold text-site-paper underline underline-offset-4 hover:text-site-reply-hover">
                    send a new link
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                {/* Two ways in: a password, or an email link (which is also
                    how an email gets verified). */}
                <div role="tablist" aria-label="Sign-in method" className="grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
                  {[
                    { label: "Password", active: !useLink, to: href({}) },
                    { label: "Email link", active: useLink, to: href({ method: "link" }) },
                  ].map((tab) => (
                    <Link
                      key={tab.label}
                      href={tab.to}
                      role="tab"
                      aria-selected={tab.active}
                      className={`flex min-h-10 items-center justify-center rounded-full text-[14px] font-semibold transition-colors ${
                        tab.active ? "bg-site-paper text-site-ink" : "text-site-dim hover:text-site-paper"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </div>

                {useLink ? (
                  <>
                    <h2 className="mt-7 text-3xl leading-tight">{linkCopy.title}</h2>
                    <p className="mt-2 text-[15px] leading-6 text-site-dim">{linkCopy.body}</p>
                    <form action={sendMagicLink} className="mt-7 space-y-5">
                      <input type="hidden" name="callbackUrl" value={callbackUrl} />
                      {reason === "forgot" && <input type="hidden" name="reason" value="forgot" />}
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
                          aria-describedby={params.error ? "login-error" : undefined}
                          className="min-h-12 w-full rounded-2xl border border-white/12 bg-black/30 px-4 text-base text-site-paper shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] transition-colors placeholder:text-site-dim/70 focus:border-site-reply focus:outline-none focus:ring-4 focus:ring-site-reply/15"
                        />
                      </div>

                      {params.error && (
                        <p
                          id="login-error"
                          role="alert"
                          className="rounded-2xl border border-site-marker/30 bg-site-marker/10 px-4 py-3 text-[15px] leading-6 text-[#ffb59e]"
                        >
                          {params.error === "Verification"
                            ? "That sign-in link has expired or was already used. Enter your email to get a new one."
                            : "The sign-in email could not be sent. Check the address and try again."}
                        </p>
                      )}

                      <MagicLinkButton />
                    </form>
                  </>
                ) : (
                  <>
                    <h2 className="mt-7 text-3xl leading-tight">Welcome back</h2>
                    <p className="mt-2 text-[15px] leading-6 text-site-dim">Sign in with your email and password.</p>
                    <div className="mt-7">
                      <PasswordSignInForm
                        callbackUrl={callbackUrl}
                        forgotHref={href({ method: "link", reason: "forgot" })}
                      />
                    </div>
                  </>
                )}

                {reason === "signup" ? (
                  <p className="mt-6 text-[14px] text-site-dim">
                    Already have an account?{" "}
                    <Link href={href({})} className="font-semibold text-site-paper underline underline-offset-4 hover:text-site-reply-hover">
                      Sign in
                    </Link>
                  </p>
                ) : (
                  <p className="mt-6 text-[14px] text-site-dim">
                    New to ReplyNxt?{" "}
                    <Link
                      href={href({ method: "link", reason: "signup" })}
                      className="font-semibold text-site-paper underline underline-offset-4 hover:text-site-reply-hover"
                    >
                      Create an account
                    </Link>
                  </p>
                )}
                <p className="mt-3 text-[13px] leading-5 text-site-dim">
                  By continuing you agree to the{" "}
                  <Link href="/terms" className="text-site-paper underline underline-offset-4 hover:text-site-reply-hover">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-site-paper underline underline-offset-4 hover:text-site-reply-hover">
                    Privacy policy
                  </Link>
                  .
                </p>
              </>
            )}
          </GlassCard>
        </Reveal>
      </div>
    </SiteShell>
  );
}
