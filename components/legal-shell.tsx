import SiteShell from "@/components/site-shell";

interface LegalShellProps {
  title: string;
  description: string;
  updatedAt: string;
  children: React.ReactNode;
}

export default function LegalShell({
  title,
  description,
  updatedAt,
  children,
}: LegalShellProps) {
  return (
    <SiteShell>
      <article className="mx-auto w-full max-w-3xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
        <p className="site-mono text-[13px] text-site-dim">Last updated {updatedAt}</p>
        <h1 className="mt-3 text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05]">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-site-dim">{description}</p>
        <div className="legal-copy mt-12 space-y-10 border-t border-white/10 pt-10 text-base">
          {children}
        </div>
      </article>
    </SiteShell>
  );
}
