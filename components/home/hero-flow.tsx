"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  flowScenes,
  type Attachment,
  type FlowMessage,
  type FlowScene,
  type FlowSheet,
} from "@/components/home/hero-flow-scenes";

/**
 * The steps of one run. Each waits this long before the next:
 * feed shown, feed scrolled, comments open, DM screen, the niche's ending.
 */
const PHASE_MS = [700, 1500, 3600, 3000, 4500];
const LAST = PHASE_MS.length - 1;

const captions = [
  "Scrolling the feed",
  "Scrolling the feed",
  "A keyword comment gets an instant public reply",
  "The private reply lands in the DMs",
];

const reduceQuery = "(prefers-reduced-motion: reduce)";

function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(reduceQuery);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(reduceQuery).matches,
    () => false
  );
}

/** Pictures for the feed's three posts: the one before, the example's, the one after. */
export interface FeedMedia {
  above?: React.ReactNode;
  target?: React.ReactNode;
  below?: React.ReactNode;
}

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as React.CSSProperties;

// The app's own dark theme: true black, grey bubbles, grey secondary text.
const APP_BG = "bg-[#050505]";
const MUTED = "text-[#a8a8a8]";
const BUBBLE = "bg-[#262626]";
const DIVIDER = "border-[#262626]";

const icons = {
  heart: "M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z",
  comment: "M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.3a8.5 8.5 0 1 1 15.5-4.6Z",
  share: "M21 3.5 10.5 13.5M21 3.5l-6.5 17-4-7-7-4 17.5-6Z",
  save: "M6 3.5h12v17l-6-4.5-6 4.5v-17Z",
  home: "M3.5 10.5 12 3.5l8.5 7v10h-6v-6h-5v6h-6v-10Z",
  search: "M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5",
  add: "M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5Zm5 4.5v8m-4-4h8",
  reels: "M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5Zm-3.5 5h17M9 3.5l3 5m2-5 3 5M10.5 12v5l4-2.5-4-2.5Z",
  back: "M15 5 8 12l7 7",
  phone: "M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z",
  video: "M3.5 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V7Zm13 3.5 4-2.5v8l-4-2.5",
  mic: "M12 3.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3Zm-6 8a6 6 0 0 0 12 0M12 17.5v3",
  image: "M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Zm-1.5 11 5-5 5 5 2-2 4.5 4.5",
  camera: "M4 8.5h3l1.5-2h7l1.5 2h3v10H4v-10Zm8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  close: "M6 6l12 12M18 6 6 18",
  lock: "M7 10.5h10v9H7v-9Zm2 0V8a3 3 0 0 1 6 0v2.5",
  chevron: "M7 10l5 5 5-5",
  more: "M5.5 12h.01M12 12h.01M18.5 12h.01",
};

function Icon({
  d,
  className = "h-[18px] w-[18px]",
  fill = false,
}: {
  d: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={fill ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/** A profile picture: a coloured initial, with a story ring when `story`. */
function Avatar({ handle, size = "h-7 w-7", story = false }: { handle: string; size?: string; story?: boolean }) {
  const tones = ["bg-[#0b3a57]", "bg-[#5c2a12]", "bg-[#1f3a2e]", "bg-[#3a2a4a]", "bg-[#4a3a12]"];
  const tone = tones[handle.length % tones.length];
  const face = (
    <span className={`flex h-full w-full items-center justify-center rounded-full ${tone} text-[45%] font-semibold uppercase text-white/90`}>
      {handle[0]}
    </span>
  );
  if (!story) return <span className={`block shrink-0 rounded-full ${size} text-[11px]`}>{face}</span>;
  return (
    <span className={`block shrink-0 rounded-full bg-gradient-to-tr from-[#f9a825] via-[#fc734d] to-[#e1306c] p-[1.5px] ${size} text-[11px]`}>
      <span className={`block h-full w-full rounded-full ${APP_BG} p-[1.5px]`}>{face}</span>
    </span>
  );
}

/** The phone's status bar, drawn over every screen. */
function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-7 items-center justify-between px-5 text-[10px] font-semibold text-white">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <svg className="h-2.5 w-3.5" viewBox="0 0 14 10" fill="currentColor" aria-hidden="true">
          <rect x="0" y="6" width="2.5" height="4" rx="0.6" />
          <rect x="3.8" y="4" width="2.5" height="6" rx="0.6" />
          <rect x="7.6" y="2" width="2.5" height="8" rx="0.6" />
          <rect x="11.4" y="0" width="2.5" height="10" rx="0.6" />
        </svg>
        <svg className="h-2.5 w-5" viewBox="0 0 22 10" fill="none" aria-hidden="true">
          <rect x="0.5" y="0.5" width="18" height="9" rx="2.5" stroke="currentColor" strokeOpacity="0.5" />
          <rect x="2" y="2" width="12" height="6" rx="1.4" fill="currentColor" />
          <rect x="19.8" y="3.2" width="1.6" height="3.6" rx="0.8" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </span>
    </div>
  );
}

const stories = ["zara.unboxes", "fitwithneha", "kunal.clicks", "sara.goa", "neha_m"];

function Stories() {
  return (
    <div className={`flex gap-2.5 overflow-hidden border-b ${DIVIDER} px-3 pb-2.5 pt-1`}>
      <div className="flex w-11 shrink-0 flex-col items-center gap-1">
        <span className="relative">
          <Avatar handle="you" size="h-10 w-10" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#050505] bg-site-reply text-[9px] leading-none text-white">
            +
          </span>
        </span>
        <span className={`w-full truncate text-center text-[8.5px] ${MUTED}`}>Your story</span>
      </div>
      {stories.map((handle) => (
        <div key={handle} className="flex w-11 shrink-0 flex-col items-center gap-1">
          <Avatar handle={handle} size="h-10 w-10" story />
          <span className="w-full truncate text-center text-[8.5px] text-white">{handle}</span>
        </div>
      ))}
    </div>
  );
}

/** A post in the feed. The example's own post carries its clip. */
function Post({
  handle,
  caption,
  likes,
  commentCount,
  ago,
  media,
  tone,
  postRef,
}: {
  handle: string;
  caption: string;
  likes: string;
  commentCount: number;
  ago: string;
  media?: React.ReactNode;
  tone: string;
  postRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={postRef} className="pb-3">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <Avatar handle={handle} size="h-6 w-6" story />
        <div className="min-w-0 leading-tight">
          <p className="text-[10.5px] font-semibold text-white">{handle}</p>
          <p className="text-[8.5px] text-white/80">Original audio</p>
        </div>
        <Icon d={icons.more} className="ml-auto h-4 w-4 text-white" />
      </div>
      <div className={`relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br ${tone}`}>
        {media}
        <svg className="absolute bottom-2 right-2 h-4 w-4 text-white/90" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 9.5h3l4-4v13l-4-4H3v-5Zm13 0 5 5m0-5-5 5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex items-center gap-3 px-3 pt-2 text-white">
        <Icon d={icons.heart} />
        <Icon d={icons.comment} />
        <Icon d={icons.share} />
        <Icon d={icons.save} className="ml-auto h-[18px] w-[18px]" />
      </div>
      <p className="px-3 pt-1.5 text-[10.5px] font-semibold text-white">{likes} likes</p>
      <p className="truncate px-3 pt-0.5 text-[10.5px] text-white">
        <span className="font-semibold">{handle}</span> {caption}
      </p>
      <p className={`px-3 pt-0.5 text-[10px] ${MUTED}`}>View all {commentCount} comments</p>
      <p className={`px-3 pt-0.5 text-[8.5px] ${MUTED}`}>{ago}</p>
    </div>
  );
}

function TabBar() {
  return (
    <div className={`absolute inset-x-0 bottom-0 z-10 flex items-center justify-around border-t ${DIVIDER} ${APP_BG} pb-3 pt-2 text-white`}>
      <Icon d={icons.home} fill className="h-[19px] w-[19px]" />
      <Icon d={icons.search} className="h-[19px] w-[19px]" />
      <Icon d={icons.add} className="h-[19px] w-[19px]" />
      <Icon d={icons.reels} className="h-[19px] w-[19px]" />
      <Avatar handle="you" size="h-[19px] w-[19px]" />
    </div>
  );
}

function Comment({
  handle,
  ago,
  children,
  small = false,
  className = "",
  style,
}: {
  handle: string;
  ago: string;
  children: React.ReactNode;
  small?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <li className={`flex gap-2 ${className}`} style={style}>
      <Avatar handle={handle} size={small ? "h-5 w-5" : "h-6 w-6"} />
      <div className="min-w-0 flex-1 text-[10.5px] leading-[1.35] text-white">
        <p>
          <span className="font-semibold">{handle}</span> <span className={MUTED}>{ago}</span>
        </p>
        <p>{children}</p>
        <p className={`mt-0.5 text-[9.5px] font-semibold ${MUTED}`}>Reply</p>
      </div>
      <Icon d={icons.heart} className={`mt-1 h-3 w-3 shrink-0 ${MUTED}`} />
    </li>
  );
}

/** A message template: picture, title, subtitle, and a button row. */
function CardBubble({ card, tapped }: { card: Attachment; tapped: boolean }) {
  const art: Record<Attachment["kind"], string> = {
    product: "from-[#5c2a12] via-[#8a3d18] to-[#fc734d]",
    pack: "from-[#0b3a57] via-[#11506f] to-[#3fa7d6]",
    doc: "from-[#e9eef0] via-[#d5dde1] to-[#b9c6cc]",
  };
  return (
    <div className={`w-[78%] overflow-hidden rounded-2xl ${BUBBLE}`}>
      <div className={`aspect-[1.9/1] bg-gradient-to-br ${art[card.kind]}`} />
      <div className="px-2.5 py-2">
        <p className="text-[10.5px] font-semibold leading-tight text-white">{card.title}</p>
        <p className={`mt-0.5 text-[9.5px] leading-tight ${MUTED}`}>{card.detail}</p>
      </div>
      <p
        className={`border-t border-white/10 py-1.5 text-center text-[10.5px] font-semibold text-site-reply ${
          tapped ? "flow-tap" : ""
        }`}
      >
        {card.action}
      </p>
    </div>
  );
}

function Message({
  message,
  tapped,
  style,
  showAvatar,
  handle,
}: {
  message: FlowMessage;
  tapped: boolean;
  style: React.CSSProperties;
  showAvatar: boolean;
  handle: string;
}) {
  const mine = message.from === "me";
  let body: React.ReactNode;
  if ("card" in message) {
    body = <CardBubble card={message.card} tapped={tapped} />;
  } else if ("button" in message) {
    body = (
      <p
        className={`w-[66%] rounded-2xl ${BUBBLE} py-1.5 text-center text-[10.5px] font-semibold text-site-reply ${
          tapped ? "flow-tap" : ""
        }`}
      >
        {message.button}
      </p>
    );
  } else {
    body = (
      <p
        className={`max-w-[74%] rounded-[1.1rem] px-2.5 py-1.5 text-[10.5px] leading-[1.35] text-white ${
          mine ? "bg-site-reply" : BUBBLE
        }`}
      >
        {message.text}
      </p>
    );
  }
  return (
    <div className={`flow-step flex items-end gap-1.5 ${mine ? "justify-end" : "justify-start"}`} style={style}>
      {!mine && (showAvatar ? <Avatar handle={handle} size="h-5 w-5" /> : <span className="w-5 shrink-0" />)}
      {body}
    </div>
  );
}

/** The in-app browser a DM button opens. */
function Browser({ sheet, handle, name }: { sheet: FlowSheet; handle: string; name: string }) {
  const host = sheet.kind === "store" ? sheet.url.split("/")[0] : `${handle}.page`;
  return (
    <div className="flex h-full flex-col bg-[#f4f6f7] text-[#101418]">
      <div className="flex items-center gap-2 border-b border-black/10 bg-white px-3 pb-2 pt-8">
        <Icon d={icons.close} className="h-4 w-4" />
        <div className="min-w-0 flex-1 text-center leading-tight">
          <p className="truncate text-[10.5px] font-semibold">{sheet.kind === "store" ? name : sheet.title}</p>
          <p className="flex items-center justify-center gap-0.5 text-[8.5px] text-black/50">
            <Icon d={icons.lock} className="h-2.5 w-2.5" />
            {host}
          </p>
        </div>
        <Icon d={icons.more} className="h-4 w-4" />
      </div>
      {sheet.kind === "store" ? (
        <div className="flex-1 p-3">
          <div className="aspect-square rounded-xl bg-gradient-to-br from-[#5c2a12] via-[#8a3d18] to-[#fc734d]" />
          <p className="mt-2.5 text-[12px] font-semibold">{sheet.title}</p>
          <p className="mt-0.5 text-[15px] font-bold">{sheet.price}</p>
          <p className="mt-0.5 text-[9.5px] text-black/55">Free shipping · Ships in 2 days</p>
          <span className="mt-2.5 block rounded-lg bg-[#101418] py-2 text-center text-[11px] font-semibold text-white">
            {sheet.action}
          </span>
        </div>
      ) : (
        <div className="flex-1 p-3">
          <div className="rounded-lg bg-white p-3 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.3)]">
            <p className="text-[8.5px] font-semibold uppercase tracking-wide text-black/45">Free checklist</p>
            <p className="mt-1 text-[15px] font-bold leading-tight">7 reel hooks that hold attention</p>
            <ul className="mt-2.5 space-y-2">
              {sheet.lines.map((line) => (
                <li key={line} className="border-b border-black/5 pb-1.5 text-[10px] leading-4">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-center text-[9px] text-black/45">Page 1 of 14</p>
        </div>
      )}
    </div>
  );
}

const easeInOut = "motion-safe:ease-[cubic-bezier(0.65,0,0.35,1)]";

/** The commenter's phone for one example, at the given step. */
function Screen({ scene, phase, feed }: { scene: FlowScene; phase: number; feed: FeedMedia }) {
  const target = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  // How far the feed scrolls to bring the example's post under the top bar.
  useLayoutEffect(() => {
    const measure = () => setOffset(target.current?.offsetTop ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const ending = phase >= LAST;
  const opensBrowser = ending && scene.next.length === 0 && scene.sheet;
  const thread = [...(phase >= 3 ? scene.dm : []), ...(ending ? scene.next : [])];

  return (
    <div
      className={`flex h-full w-[200%] motion-safe:transition-transform motion-safe:duration-700 ${easeInOut}`}
      style={{ transform: phase >= 3 ? "translateX(-50%)" : undefined }}
    >
      {/* Feed */}
      <div className={`relative h-full w-1/2 overflow-hidden ${APP_BG}`}>
        <div className={`absolute inset-x-0 top-0 z-10 flex h-[3.4rem] items-end justify-between px-3 pb-1.5 ${APP_BG}`}>
          <span className="flex items-center gap-0.5 text-[15px] font-bold tracking-tight text-white">
            For you
            <Icon d={icons.chevron} className="h-3.5 w-3.5" />
          </span>
          <span className="flex items-center gap-3.5 text-white">
            <Icon d={icons.heart} className="h-[19px] w-[19px]" />
            <span className="relative">
              <Icon d={icons.share} className="h-[19px] w-[19px]" />
              <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#ff3040] px-0.5 text-[8px] font-bold">
                2
              </span>
            </span>
          </span>
        </div>
        <div
          className={`absolute inset-x-0 top-[3.4rem] motion-safe:transition-transform motion-safe:duration-[1300ms] ${easeInOut}`}
          style={{ transform: phase >= 1 ? `translateY(-${offset}px)` : undefined }}
        >
          <Stories />
          <Post
            handle="zara.unboxes"
            caption="my festive order finally came"
            likes="934"
            commentCount={41}
            ago="1 hour ago"
            media={feed.above}
            tone="from-[#1f3a2e] via-[#0b2a20] to-[#08141a]"
          />
          <Post
            postRef={target}
            handle={scene.handle}
            caption={scene.caption}
            likes={scene.likes}
            commentCount={scene.commentCount}
            ago="3 hours ago"
            media={feed.target}
            tone="from-[#0b3a57] via-[#08141a] to-[#3a1a10]"
          />
          <Post
            handle="fitwithneha"
            caption="10 minute leg day, save this"
            likes="3,102"
            commentCount={128}
            ago="5 hours ago"
            media={feed.below}
            tone="from-[#3a1a10] via-[#08141a] to-[#0b3a57]"
          />
        </div>
        <TabBar />

        {/* Comments sheet */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 flex h-[70%] flex-col rounded-t-[1.1rem] bg-[#1c1c1c] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]`}
          style={{ transform: phase >= 2 ? "translateY(0)" : "translateY(105%)" }}
        >
          <span aria-hidden="true" className="mx-auto mt-1.5 block h-1 w-8 rounded-full bg-white/30" />
          <p className="border-b border-white/10 py-2 text-center text-[11px] font-semibold text-white">Comments</p>
          {phase >= 2 && (
            <ul className="flex-1 space-y-2.5 overflow-hidden px-3 pt-2.5">
              {scene.earlier.slice(-1).map((comment, index) => (
                <Comment key={comment.handle} handle={comment.handle} ago={`${index + 2}h`}>
                  {comment.text}
                </Comment>
              ))}
              <Comment handle={scene.commenter} ago="now" className="flow-step" style={delay(0.5)}>
                <mark className="flow-mark marker rounded-sm font-semibold" style={delay(1.1)}>
                  {scene.keyword}
                </mark>
                {scene.rest}
              </Comment>
              {/* The public reply, posted the moment the keyword matches. */}
              <Comment
                handle={scene.handle}
                ago="now · Author"
                small
                className="flow-step ml-8"
                style={delay(1.8)}
              >
                <span className="text-site-reply">@{scene.commenter}</span> {scene.publicReply}
              </Comment>
            </ul>
          )}
          <div className="flex items-center gap-2 border-t border-white/10 px-3 pb-3 pt-2">
            <Avatar handle="you" size="h-6 w-6" />
            <span className={`flex-1 truncate rounded-full border border-white/15 px-2.5 py-1.5 text-[9.5px] ${MUTED}`}>
              Add a comment for {scene.handle}...
            </span>
          </div>
        </div>
      </div>

      {/* DM thread, from the commenter's side */}
      <div className={`relative flex h-full w-1/2 flex-col overflow-hidden ${APP_BG}`}>
        <div className={`flex items-center gap-2 border-b ${DIVIDER} px-3 pb-2 pt-8 text-white`}>
          <Icon d={icons.back} className="h-4 w-4" />
          <Avatar handle={scene.handle} size="h-7 w-7" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[11px] font-semibold">{scene.name}</p>
            <p className={`truncate text-[9px] ${MUTED}`}>{scene.handle}</p>
          </div>
          <Icon d={icons.phone} className="h-4 w-4" />
          <Icon d={icons.video} className="h-[18px] w-[18px]" />
        </div>
        <div className="flex flex-1 flex-col justify-end gap-1 overflow-hidden px-2.5 pb-2">
          <p className={`flow-step pb-1 text-center text-[8.5px] ${MUTED}`} style={delay(0.4)}>
            Today 9:41
          </p>
          {thread.map((message, index) => {
            const fromDm = index < scene.dm.length;
            const following = thread[index + 1];
            return (
              <Message
                key={index}
                message={message}
                handle={scene.handle}
                showAvatar={message.from === "them" && (!following || following.from !== "them")}
                tapped={ending && fromDm && index === scene.dm.length - 1}
                style={delay(fromDm ? 0.7 + index * 0.5 : 0.6 + (index - scene.dm.length) * 0.7)}
              />
            );
          })}
        </div>
        <div className={`mx-2.5 mb-3 flex items-center gap-2 rounded-full ${BUBBLE} p-1 pr-2.5 text-white`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-site-reply">
            <Icon d={icons.camera} className="h-3.5 w-3.5" />
          </span>
          <span className={`flex-1 text-[10px] ${MUTED}`}>Message...</span>
          <Icon d={icons.mic} className="h-4 w-4" />
          <Icon d={icons.image} className="h-4 w-4" />
        </div>

        {/* Where the tap leads, for the examples that open a page. */}
        {opensBrowser && scene.sheet && (
          <div className="flow-sheet absolute inset-0 z-20" style={delay(1.1)}>
            <Browser sheet={scene.sheet} handle={scene.handle} name={scene.name} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A phone running the app, showing one example at one step. The hero plays it
 * on a timer.
 */
export function InstagramPhone({
  scene,
  phase,
  feed,
  run = 0,
  className = "",
  children,
  ...rest
}: {
  scene: FlowScene;
  phase: number;
  feed: FeedMedia;
  /** Changing it replays the example from the start. */
  run?: number;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">) {
  return (
    <div
      {...rest}
      className={`relative aspect-[9/17.4] rounded-[2.6rem] border border-white/15 bg-[#0a0a0a] p-2 shadow-[0_40px_120px_-30px_rgba(2,151,222,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] ${className}`}
    >
      {children}
      <div aria-hidden="true" className={`relative h-full w-full overflow-hidden rounded-[2.1rem] ${APP_BG}`}>
        {/* Remounting resets the feed and thread for each run. */}
        <Screen key={`${scene.id}-${run}`} scene={scene} phase={phase} feed={feed} />
        <StatusBar />
        <div className="absolute left-1/2 top-1.5 z-50 h-5 w-[4.5rem] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

/**
 * The hero's phone: someone scrolls the feed, comments a keyword, gets an
 * instant public reply, then the DM, and the ending fits the niche (a store
 * page, a follow-gated preset pack, a guide). It moves on by itself until the
 * visitor picks a tab, hovers, or focuses it; with reduced motion it shows the
 * last step of each example.
 */
export default function HeroFlow({
  feeds,
  scrollPhase = null,
}: {
  feeds: FeedMedia[];
  /** A step set by the page's scroll; while set, it replaces the timer. */
  scrollPhase?: number | null;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState(0);
  const [held, setHeld] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [visible, setVisible] = useState(true);
  // Bumped when a tab is picked, so picking the current one replays it.
  const [run, setRun] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || held || !visible || scrollPhase !== null) return;
    if (phase === LAST && chosen) return;
    const timer = window.setTimeout(() => {
      if (phase < LAST) {
        setPhase(phase + 1);
      } else {
        setActive((index) => (index + 1) % flowScenes.length);
        setPhase(0);
      }
    }, PHASE_MS[phase]);
    return () => window.clearTimeout(timer);
  }, [phase, held, chosen, visible, reduce, run, scrollPhase]);

  function choose(index: number) {
    setActive(index);
    setPhase(0);
    setChosen(true);
    setRun((count) => count + 1);
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + flowScenes.length) % flowScenes.length;
    choose(next);
    tabs.current[next]?.focus();
  }

  const scene = flowScenes[active];
  const shown = scrollPhase ?? (reduce ? LAST : phase);

  return (
    <div
      ref={root}
      className="flex flex-col items-center gap-3"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div data-flow-chrome role="tablist" aria-label="Example campaigns" className="glass flex rounded-full p-1">
        {flowScenes.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`flow-tab-${item.id}`}
            aria-selected={index === active}
            aria-controls="flow-panel"
            tabIndex={index === active ? 0 : -1}
            onClick={() => choose(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`site-mono min-h-11 rounded-full px-3.5 text-[12px] transition-colors md:min-h-9 ${
              index === active ? "bg-white/10 text-site-paper" : "text-site-dim hover:text-site-paper"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <InstagramPhone
        id="flow-panel"
        data-flow-phone
        role="tabpanel"
        aria-labelledby={`flow-tab-${scene.id}`}
        aria-describedby="flow-summary"
        scene={scene}
        phase={shown}
        feed={feeds[active] ?? {}}
        run={run}
        className="w-[min(290px,calc((100dvh-15rem)*9/17.4))] min-w-[230px]"
      >
        <p id="flow-summary" className="sr-only">
          {scene.commenter} comments {scene.keyword} on {scene.handle}&apos;s post, gets a public reply
          and a private DM. {scene.outcome}.
        </p>
      </InstagramPhone>

      {/* Which step is playing, with a dot for each of the four steps. */}
      <div data-flow-chrome className="flex min-h-5 items-center gap-2.5">
        <span aria-hidden="true" className="flex gap-1">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={`h-1 rounded-full transition-all duration-300 ${
                Math.max(shown, 1) === step ? "w-4 bg-site-marker" : "w-1 bg-white/25"
              }`}
            />
          ))}
        </span>
        <p className="site-mono text-[12px] text-site-paper">{captions[shown] ?? scene.outcome}</p>
      </div>
    </div>
  );
}
