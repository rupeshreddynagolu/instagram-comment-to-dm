import fs from "node:fs";
import path from "node:path";
import LoopVideo from "@/components/site/loop-video";

// Photos and clips are generated separately and dropped into public/. A slot
// whose file is not there yet shows a gradient, so pages never break on a
// missing asset. Checked once per process.
const present = new Map<string, boolean>();

function hasPublicFile(relative: string) {
  let found = present.get(relative);
  if (found === undefined) {
    found = fs.existsSync(path.join(process.cwd(), "public", relative));
    present.set(relative, found);
  }
  return found;
}

const placeholderTones = [
  "from-[#0b3a57] via-[#08141a] to-[#3a1a10]",
  "from-[#3a1a10] via-[#08141a] to-[#0b3a57]",
  "from-[#0f1f27] via-[#0b3a57] to-[#08141a]",
];

function Placeholder({ seed, className }: { seed: string; className: string }) {
  const tone = placeholderTones[seed.length % placeholderTones.length];
  return <div aria-hidden="true" className={`bg-gradient-to-br ${tone} ${className}`} />;
}

/** A photo from public/images/<name>.webp, or a gradient until it exists. */
export function Photo({
  name,
  alt,
  className = "",
  eager = false,
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const src = `/images/${name}.webp`;
  if (!hasPublicFile(`images/${name}.webp`)) {
    return <Placeholder seed={name} className={className} />;
  }
  return (
    // Pre-compressed WebP; Next's on-server resizer needs a native module
    // that would not match the Linux host the package is built for.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}

/**
 * A muted looping clip from public/video/<name>.mp4 that plays only while
 * visible. Falls back to its poster photo, then to a gradient.
 */
export function Clip({
  name,
  poster,
  className = "",
  label,
  controls = false,
}: {
  name: string;
  poster?: string;
  className?: string;
  label: string;
  /** Show a pause/play button (the hero's background clip). */
  controls?: boolean;
}) {
  const hasVideo = hasPublicFile(`video/${name}.mp4`);
  const posterSrc =
    poster && hasPublicFile(`images/${poster}.webp`) ? `/images/${poster}.webp` : undefined;

  if (!hasVideo) {
    return poster ? (
      <Photo name={poster} alt={label} className={className} />
    ) : (
      <Placeholder seed={name} className={className} />
    );
  }
  return (
    <LoopVideo
      src={`/video/${name}.mp4`}
      poster={posterSrc}
      label={label}
      controls={controls}
      className={`object-cover ${className}`}
    />
  );
}
