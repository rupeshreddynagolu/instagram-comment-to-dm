// The examples the hero phone plays. Kept out of the client component so the
// server-rendered hero can read them too.

export type Attachment = {
  kind: "product" | "pack" | "doc";
  title: string;
  detail: string;
  action: string;
};

/** A message in the DM thread, seen from the commenter's phone. */
export type FlowMessage =
  | { from: "them" | "me"; text: string }
  | { from: "them"; card: Attachment }
  | { from: "them"; button: string };

/** What opens after the commenter taps through, if anything. */
export type FlowSheet =
  | { kind: "store"; url: string; title: string; price: string; action: string }
  | { kind: "pdf"; title: string; lines: string[] };

export interface FlowScene {
  id: string;
  /** The tab's name. */
  label: string;
  handle: string;
  /** The account's display name, shown in the DM header. */
  name: string;
  caption: string;
  likes: string;
  commentCount: number;
  /** Comments already under the post. */
  earlier: { handle: string; text: string }[];
  commenter: string;
  keyword: string;
  /** The rest of the comment, after the keyword. */
  rest: string;
  /** The public reply ReplyNxt posts under the comment. */
  publicReply: string;
  /** The first private reply. */
  dm: FlowMessage[];
  /** What happens next, which differs by niche. */
  next: FlowMessage[];
  sheet?: FlowSheet;
  /** The last step's caption. */
  outcome: string;
}

export const flowScenes: FlowScene[] = [
  {
    id: "store",
    label: "Online store",
    handle: "kesari.skin",
    name: "Kesari Skin",
    likes: "2,418",
    commentCount: 184,
    caption: "Saffron Glow serum is back in stock",
    earlier: [
      { handle: "divya.r", text: "the texture looks so good" },
      { handle: "neha_m", text: "does it suit oily skin?" },
    ],
    commenter: "ananya.k",
    keyword: "PRICE",
    rest: " pls",
    publicReply: "Sent it to your DMs, Ananya",
    dm: [
      { from: "them", text: "Hi Ananya! Saffron Glow is ₹849 today, free shipping." },
      {
        from: "them",
        card: { kind: "product", title: "Saffron Glow Serum", detail: "₹849 · 37 left", action: "Buy now" },
      },
    ],
    next: [],
    sheet: {
      kind: "store",
      url: "kesari.skin/saffron-glow",
      title: "Saffron Glow Serum, 30 ml",
      price: "₹849",
      action: "Add to cart",
    },
    outcome: "Tap opens the product page, click tracked",
  },
  {
    id: "creator",
    label: "Creators",
    handle: "tanvi.wanders",
    name: "Tanvi | Travel",
    likes: "8,903",
    commentCount: 612,
    caption: "How I edit every Goa reel",
    earlier: [
      { handle: "kunal.clicks", text: "those colours though" },
      { handle: "sara.goa", text: "need this for my trip" },
    ],
    commenter: "rohan.fits",
    keyword: "PRESET",
    rest: " please!!",
    publicReply: "Check your DMs, Rohan",
    dm: [
      {
        from: "them",
        text: "quick favor before i send your presets: follow this account, then tap below",
      },
      { from: "them", button: "I followed" },
    ],
    next: [
      { from: "me", text: "I followed" },
      { from: "them", text: "Thanks for following, Rohan! Your presets:" },
      {
        from: "them",
        card: { kind: "pack", title: "Monsoon preset pack", detail: "12 presets", action: "Download" },
      },
    ],
    outcome: "Follow checked, presets delivered",
  },
  {
    id: "docs",
    label: "Guides and docs",
    handle: "kabir.grows",
    name: "Kabir Mehra",
    likes: "1,276",
    commentCount: 97,
    caption: "The 7 hooks behind my last 40 reels",
    earlier: [
      { handle: "aditi.writes", text: "hook 3 is genius" },
      { handle: "vik.edits", text: "saving this" },
    ],
    commenter: "meera.shop",
    keyword: "HOOKS",
    rest: " please",
    publicReply: "Just sent you the list, Meera",
    dm: [
      { from: "them", text: "Here you go, Meera. The full checklist:" },
      {
        from: "them",
        card: { kind: "doc", title: "reel-hooks.pdf", detail: "PDF · 14 pages", action: "Open" },
      },
    ],
    next: [],
    sheet: {
      kind: "pdf",
      title: "reel-hooks.pdf",
      lines: [
        "1. Start mid-sentence",
        "2. Show the result first",
        "3. Name the mistake",
        "4. Ask the viewer a question",
      ],
    },
    outcome: "Guide opened, click tracked",
  },
];
