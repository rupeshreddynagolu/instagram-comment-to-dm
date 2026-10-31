import Link from "next/link";
import SignInForm from "@/components/sign-in-form";
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
  { title: "Enter your email", body: "Back again? Use your password. New here? We email a link to verify it." },
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
  }>;
}) {
  const params = await searchParams;
  const checkEmail = isCheckEmailRedirect(params);
  const selectedTemplate = getCampaignTemplate(params.template);
  const templateCallbackUrl = selectedTemplate
    ? `/campaigns/new?template=${selectedTemplate.slug}`
    : null;
  const callbackUrl = params.callbackUrl ?? templateCallbackUrl ?? "/dashboard";

  const linkError = params.error
    ? params.error === "Verification"
      ? "That sign-in link has expired or was already used. Enter your email to get a new one."
      : "The sign-in email could not be sent. Check the address and try again."
    : null;

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
                  <Link href="/login" className="font-semibold text-site-paper underline underline-offset-4 hover:text-site-reply-hover">
                    send a new link
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl leading-tight">Sign in or create an account</h2>
                <p className="mt-2 text-[15px] leading-6 text-site-dim">
                  Start with your email. We&apos;ll ask for your password, or send a link if you&apos;re new.
                </p>
                <div className="mt-7">
                  <SignInForm callbackUrl={callbackUrl} linkError={linkError} />
                </div>
                <p className="mt-6 text-[13px] leading-5 text-site-dim">
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
