import type { SeoPageConfig } from "@/components/seo-page-shell";

// Templates offered on each guide; keywords match lib/templates/campaign-templates.ts.
const template = {
  dtc: { label: "DTC product link", keywords: ["LINK", "SHOP", "BUY"], href: "/templates/dtc-product-link" },
  realEstate: { label: "Real estate lead form", keywords: ["HOME", "LISTING", "VALUE"], href: "/templates/real-estate-lead-form" },
  fitness: { label: "Fitness plan download", keywords: ["PLAN", "FIT", "START"], href: "/templates/fitness-plan" },
  webinar: { label: "Course webinar invite", keywords: ["WEBINAR", "CLASS", "LEARN"], href: "/templates/course-webinar" },
  beauty: { label: "Beauty price list", keywords: ["PRICE", "MENU", "BOOK"], href: "/templates/beauty-price-list" },
  restaurant: { label: "Restaurant menu and booking", keywords: ["MENU", "TABLE", "RESERVE"], href: "/templates/restaurant-menu" },
  event: { label: "Event RSVP", keywords: ["RSVP", "TICKET", "JOIN"], href: "/templates/event-rsvp" },
  creator: { label: "Creator media kit", keywords: ["COLLAB", "KIT", "RATES"], href: "/templates/creator-media-kit" },
};

export const manychatAlternativePage: SeoPageConfig = {
  eyebrow: "Manychat alternative",
  title: "A focused Manychat alternative for Instagram comment-to-DM",
  description:
    "If all you need is comment LINK, get a DM, ReplyNxt does that one job well: keyword comments become official private replies with tracked links and reports you can share.",
  primaryCta: "Start free",
  bullets: [
    "One campaign per post or reel: keywords, reply, link",
    "Official Meta API, no scraping and no password sharing",
    "Tracked links and shareable client reports",
    "MIT-licensed open-source core, or the hosted app",
  ],
  sectionsTitle: "Built for one job, not every chat",
  sections: [
    {
      title: "Narrow on purpose",
      body: "Broad chatbot builders are powerful, but every campaign becomes a flow to build and maintain. ReplyNxt keeps the path short: keyword, post, reply, link, result.",
    },
    {
      title: "Proof for clients",
      body: "Tracked links and read-only report pages show what happened after the comment, not just that a message went out.",
    },
    {
      title: "Meta-first delivery",
      body: "Comments arrive by webhook, are queued, checked for duplicates and plan limits, then answered as private replies to that comment.",
    },
  ],
  comparisonTitle: "ReplyNxt next to a broad chatbot builder",
  comparisonOther: "Broad chatbot builder",
  comparisons: [
    {
      label: "Setup",
      replynxt: "Pick a post or reel, add keywords, write the reply.",
      other: "Design and maintain a conversation flow.",
    },
    {
      label: "Reporting",
      replynxt: "Sends, skips, failures, clicks and click rate per campaign, with a link to share.",
      other: "Wider conversation analytics that need cleaning up before a client sees them.",
    },
    {
      label: "Scope",
      replynxt: "Instagram comment-to-DM campaigns for brands, creators and agencies.",
      other: "Many channels and many kinds of automation.",
    },
  ],
  templateLinks: [template.dtc, template.beauty, template.creator],
  faqs: [
    {
      title: "Is ReplyNxt a full Manychat replacement?",
      body: "No, and that's deliberate. ReplyNxt only does Instagram comment-to-DM campaigns. If you need a chatbot across channels, a broad platform suits you better; if you need fast comment campaigns, ReplyNxt is built for exactly that.",
    },
    {
      title: "Can I move my existing comment automations?",
      body: "Yes, by recreating them as campaigns: choose the post or reel, add the same keywords, and paste your reply. Most take a couple of minutes each.",
    },
    {
      title: "Does it work for agencies?",
      body: "Yes. The Agency plan connects up to 10 Instagram accounts, adds team members with roles, filters everything by account, and gives each campaign a shareable report.",
    },
  ],
};

export const templatesSeoPage: SeoPageConfig = {
  eyebrow: "Instagram comment-to-DM templates",
  title: "Comment-to-DM templates for the replies people actually ask for",
  description:
    "Ready-made campaigns for product links, lead magnets, price lists, webinars, events and local services, each with its keywords, goal and reply written for you.",
  primaryCta: "Use a template",
  secondaryCta: { label: "See all templates", href: "/templates" },
  bullets: [
    "Keywords, a campaign goal and reply copy in every template",
    "Pick a template before signing up and it's waiting for you after",
    "Tracked links show which replies turned into clicks",
    "Agencies can reuse the same template for every client",
  ],
  sectionsTitle: "Three patterns cover most campaigns",
  sections: [
    {
      title: "Product link drops",
      body: "LINK, SHOP, BUY or SIZE comments get the exact product page, bundle or collection, sent the moment someone asks.",
    },
    {
      title: "Lead magnets",
      body: "GUIDE, CHECKLIST, PLAN or START comments get a free resource, then a follow-up offer.",
    },
    {
      title: "Local services",
      body: "PRICE, BOOK, INFO or TOUR comments get a price list, booking link or quote form.",
    },
  ],
  comparisonTitle: "A template campaign next to replying by hand",
  comparisonOther: "Replying by hand",
  comparisons: [
    {
      label: "Speed",
      replynxt: "Launch from a template in minutes, then reuse it.",
      other: "Type the same reply again for every comment.",
    },
    {
      label: "Measurement",
      replynxt: "Clicks and top keywords per campaign.",
      other: "Screenshots, memory, or link data spread across tools.",
    },
    {
      label: "Busy posts",
      replynxt: "Every matching comment gets its reply, even when a reel takes off.",
      other: "Comments get missed once they pile up.",
    },
  ],
  templateLinks: [template.dtc, template.fitness, template.webinar, template.restaurant, template.event, template.realEstate],
  faqs: [
    {
      title: "Can I edit a template's copy?",
      body: "Yes. Templates are starting points: change the keywords, the private reply, the link it sends, and whether the campaign is live.",
    },
    {
      title: "Do templates work on reels?",
      body: "Yes. A campaign can target any post or reel on the connected Instagram professional account.",
    },
    {
      title: "Can I use my own keywords?",
      body: "Yes. Add as many as you like, such as PRICE or WAITLIST, or a word in any language.",
    },
  ],
};

export const agenciesSeoPage: SeoPageConfig = {
  eyebrow: "Instagram DM automation for agencies",
  title: "Comment-to-DM campaigns for every client, from one workspace",
  description:
    "Connect your clients' Instagram accounts, run repeatable comment campaigns for each, and send them a report link that shows the results without exposing your workspace.",
  primaryCta: "Start an agency workspace",
  secondaryCta: { label: "See Agency pricing", href: "/#pricing" },
  bullets: [
    "Up to 10 client Instagram accounts on the Agency plan",
    "Campaigns, logs and stats filtered by account",
    "Teammates as owners, admins or members",
    "Read-only report links for each client",
  ],
  sectionsTitle: "What changes when you run it for clients",
  sections: [
    {
      title: "Clients stay separate",
      body: "Filter campaigns, logs and stats by account, so ten brands in one workspace never blur together.",
    },
    {
      title: "Services you can repeat",
      body: "Package lead magnets, product drops, price replies and launch waitlists as offers you run again for each client.",
    },
    {
      title: "Proof of work",
      body: "Report links show sends, skips, failures, clicks, click rate, top keywords and links, without your workspace controls or DM copy.",
    },
  ],
  comparisonTitle: "Running client campaigns: ReplyNxt next to the usual setup",
  comparisonOther: "The usual setup",
  comparisons: [
    {
      label: "Client reporting",
      replynxt: "A read-only report link per campaign; unbranded on paid plans.",
      other: "Screenshots, or dashboards that show clients too much.",
    },
    {
      label: "Team access",
      replynxt: "Owner, admin and member roles with invite links.",
      other: "One shared login, or teammates with full access.",
    },
    {
      label: "Many accounts",
      replynxt: "Every view filters by Instagram account.",
      other: "Client work mixed together in one place.",
    },
  ],
  templateLinks: [template.dtc, template.beauty, template.realEstate],
  faqs: [
    {
      title: "How many Instagram accounts can an agency connect?",
      body: "Up to 10 on the Agency plan. If you need more, the Custom plan on the pricing page is for you.",
    },
    {
      title: "Can clients see reports without logging in?",
      body: "Yes. Each report is a read-only link that hides your workspace controls and the DM copy.",
    },
    {
      title: "Can my team work in the same workspace?",
      body: "Yes. Invite teammates as admins or members; only owners manage billing.",
    },
  ],
};

export const commentLinkSeoPage: SeoPageConfig = {
  eyebrow: "Comment LINK automation",
  title: "Comment LINK on Instagram, get the link in a DM",
  description:
    "Followers comment LINK, SHOP, GUIDE or any keyword you choose, and each one gets a private reply with the right link, tracked so you can see who clicked.",
  primaryCta: "Automate comment LINK",
  bullets: [
    "Match whole words or parts of words, in any language",
    "Official private replies to the comment that asked",
    "Tracked links with click counts",
    "Every comment logged as sent, skipped or failed",
  ],
  sectionsTitle: "Where comment LINK pays off",
  sections: [
    {
      title: "Product links",
      body: "Turn LINK comments into visits to product pages, landing pages, waitlists or checkout, and see how many clicked.",
    },
    {
      title: "Creator offers",
      body: "Send guides, free resources, course links and coaching applications without watching the inbox.",
    },
    {
      title: "Launch spikes",
      body: "When a reel takes off, replies queue up and go out in order, within your plan's limits.",
    },
  ],
  comparisonTitle: "Comment LINK automation next to pasting links by hand",
  comparisonOther: "Pasting links by hand",
  comparisons: [
    {
      label: "Coverage",
      replynxt: "Every matching comment on the post or reel gets its reply.",
      other: "Comments get missed when they spike.",
    },
    {
      label: "Tracking",
      replynxt: "Clicks counted per campaign.",
      other: "A pasted link shows nothing about who clicked.",
    },
    {
      label: "Account safety",
      replynxt: "Official private replies, paced by a queue.",
      other: "Browser automation or scraping tools can put the account at risk.",
    },
  ],
  templateLinks: [template.dtc, template.fitness, template.event],
  faqs: [
    {
      title: "Can I use keywords other than LINK?",
      body: "Yes. Each campaign can have several, such as PRICE, SHOP, GUIDE, PLAN, WAITLIST or TOUR, or a phrase of your own.",
    },
    {
      title: "Is this a normal Instagram DM?",
      body: "It's a private reply: Instagram's official way to message someone who commented, linked to their comment.",
    },
    {
      title: "Can a comment get two replies by mistake?",
      body: "No. Instagram allows one private reply per comment, and ReplyNxt sends at most one, even if the same comment arrives twice or matches two campaigns. The extra attempt is logged as skipped.",
    },
  ],
};
