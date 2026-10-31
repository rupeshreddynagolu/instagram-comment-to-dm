import PublicSiteFooter from "@/components/public-site-footer";
import PublicSiteHeader, { type SiteSection } from "@/components/public-site-header";
import LiquidCursor from "@/components/site/liquid-cursor";
import SmoothScroll from "@/components/site/smooth-scroll";
import { siteFontVariables } from "@/lib/fonts";

interface SiteShellProps {
  active?: SiteSection;
  /** Login and invitations keep the header but drop the footer. */
  footer?: boolean;
  /** Let the first section run under the floating header (the home hero). */
  flushTop?: boolean;
  children: React.ReactNode;
}

/** Header, smooth scrolling, typefaces and colours shared by every public page. */
export default function SiteShell({
  active,
  footer = true,
  flushTop = false,
  children,
}: SiteShellProps) {
  return (
    <div className={`${siteFontVariables} site flex min-h-[100dvh] flex-col`}>
      <SmoothScroll />
      <LiquidCursor />
      <PublicSiteHeader active={active} />
      <main className={`relative z-[1] flex-1 ${flushTop ? "" : "pt-24 sm:pt-28"}`}>{children}</main>
      {footer && <PublicSiteFooter />}
    </div>
  );
}
