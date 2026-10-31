import type { FeedMedia } from "@/components/home/hero-flow";
import { Clip } from "@/components/site/media";

// Each example's own post plays the audience reel that fits it; the posts
// around it are other accounts' reels from the same set.
const exampleReel: Record<string, string> = {
  store: "aud-beauty",
  creator: "aud-creator",
  docs: "aud-course",
};

function Reel({ name, label }: { name: string; label: string }) {
  return <Clip name={name} poster={name} label={label} className="h-full w-full" />;
}

/**
 * The reels in the phone's feed: an unboxing above, the example's own reel,
 * a workout below. Each shows a gradient until its file is in public/.
 */
export function feedMedia(id: string): FeedMedia {
  return {
    above: <Reel name="aud-launch" label="" />,
    target: <Reel name={exampleReel[id] ?? "aud-dtc"} label="" />,
    below: <Reel name="aud-fitness" label="" />,
  };
}
