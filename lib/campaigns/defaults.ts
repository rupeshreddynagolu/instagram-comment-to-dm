/**
 * Default copy for campaign messages the owner leaves blank. Shared by the DM
 * worker, the campaign builder and its preview so all three say the same thing.
 */

export const DEFAULT_FOLLOW_PROMPT =
  "quick favor before i send your link: follow this account, then tap the button below and i'll send it right over";

/** The goals a campaign can be filed under; the templates use the same set. */
export const CAMPAIGN_GOALS = [
  "Lead magnet delivery",
  "Product link request",
  "Price or availability reply",
  "Launch waitlist",
  "Agency client campaign",
] as const;

export const DEFAULT_FOLLOW_UP =
  "btw just wanted to say thanks, i really appreciate the support 🙌";
