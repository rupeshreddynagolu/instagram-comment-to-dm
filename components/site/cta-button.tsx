import Link from "next/link";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "secondary";

// Height, padding and type per size. md and lg meet the 44px hit area; sm is
// the header's, 44px on touch screens and 36px where there's a pointer.
const sizes: Record<Size, { box: string; chevron: string }> = {
  sm: { box: "min-h-11 px-4 text-[13px] md:min-h-9", chevron: "h-3 w-3" },
  md: { box: "min-h-11 px-5 text-[15px]", chevron: "h-3.5 w-3.5" },
  lg: { box: "min-h-[3.25rem] px-7 text-[17px]", chevron: "h-4 w-4" },
};

export function ctaClasses({
  size = "md",
  variant = "primary",
  className = "",
}: {
  size?: Size;
  variant?: Variant;
  className?: string;
}) {
  return `cta ${variant === "secondary" ? "cta-secondary" : ""} ${sizes[size].box} ${className}`;
}

/** The chevron after the label, for buttons that render their own element. */
export function CtaChevron({ size = "md" }: { size?: Size }) {
  return (
    <svg
      className={`cta-chevron ${sizes[size].chevron}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

/**
 * The site's call to action: a solid blue capsule with a chevron. `secondary`
 * is the quieter capsule for choices beside the main one.
 */
export default function CtaButton({
  href,
  children,
  size = "md",
  variant = "primary",
  chevron = true,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  size?: Size;
  variant?: Variant;
  /** Off where the button sits among plain items, like the header's. */
  chevron?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={ctaClasses({ size, variant, className })}>
      <span>{children}</span>
      {chevron && <CtaChevron size={size} />}
    </Link>
  );
}
