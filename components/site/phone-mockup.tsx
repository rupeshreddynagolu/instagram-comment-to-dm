import { Clip, Photo } from "@/components/site/media";

/** A round profile picture, or its gradient stand-in. */
export function Avatar({ name, className = "h-8 w-8" }: { name: string; className?: string }) {
  return (
    <span className={`block shrink-0 overflow-hidden rounded-full ring-1 ring-white/15 ${className}`}>
      <Photo name={name} alt="" className="h-full w-full" />
    </span>
  );
}

/**
 * A phone showing an Instagram reel. The clip fills the screen; `children`
 * are layered on top (comments, a DM thread) so scenes can animate them.
 */
export default function PhoneMockup({
  clip,
  poster,
  handle,
  avatar,
  label,
  children,
  className = "",
}: {
  clip: string;
  poster: string;
  handle: string;
  avatar: string;
  /** What the reel shows, for screen readers. */
  label: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[9/19] w-full max-w-[300px] rounded-[3rem] border border-white/15 bg-[#060b0e] p-2.5 shadow-[0_40px_120px_-30px_rgba(2,151,222,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-site-panel">
        <Clip name={clip} poster={poster} label={label} className="absolute inset-0 h-full w-full" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />

        {/* Dynamic Island */}
        <div aria-hidden="true" className="absolute left-1/2 top-2.5 h-6 w-24 -translate-x-1/2 rounded-full bg-[#060b0e]" />

        <div className="absolute inset-x-0 top-11 flex items-center gap-2 px-4">
          <Avatar name={avatar} className="h-7 w-7" />
          <span className="text-[13px] font-semibold text-white">{handle}</span>
          <span className="ml-auto rounded-md border border-white/40 px-2 py-0.5 text-[11px] font-semibold text-white">
            Follow
          </span>
        </div>

        {children && <div className="absolute inset-0">{children}</div>}
      </div>
    </div>
  );
}
