import SplitHeadline from "@/components/site/split-headline";

/** Mono label above a serif heading: the one heading style every section uses. */
export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className = "",
}: {
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      <p className="site-mono text-[13px] text-site-dim">{label}</p>
      <SplitHeadline className="mt-3 text-4xl leading-[1.05] sm:text-5xl">{title}</SplitHeadline>
      {description && (
        <p className={`mt-5 text-base leading-7 text-site-dim ${centered ? "mx-auto" : ""} max-w-xl`}>
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * The site's one card: frosted glass with a lit top edge. `glow` adds a
 * orange edge for the one card on the page that should stand out (Pro).
 */
export function GlassCard({
  children,
  className = "",
  glow,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "orange";
  as?: "div" | "article" | "li" | "aside";
}) {
  const glowClass = glow === "orange" ? "glass-glow-orange" : "";
  return <Tag className={`glass rounded-[1.75rem] ${glowClass} ${className}`}>{children}</Tag>;
}
