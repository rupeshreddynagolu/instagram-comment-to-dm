# Campaign builder: port openreply's campaign features into ReplyNxt

## Intent

ReplyNxt's campaign page today does one thing: pick a post, set keywords, send
one DM. openreply (the later fork in `../openreply`) grew a much richer
campaign system on the same codebase. Bring that system into ReplyNxt so its
campaign page works like openreply's, while keeping every campaign feature
ReplyNxt already has.

## What ReplyNxt keeps (must not regress)

- Campaign **goal** and the public **campaign templates** (`/templates`,
  "use this template" into a new campaign).
- **Tracked links**, click analytics, CTR, and shareable **campaign reports**.
- **Plan limits** (max campaigns, DMs per month, accounts) and both billing
  providers. openreply removed billing; ReplyNxt's stays as it is.
- **Agency workspaces**: roles, invites, per-account filtering.
- Whole-word keyword matching, the rate limiter, the DM log and diagnostics.

## What comes over from openreply

1. **Campaign builder**: one page for new and edit (`/campaigns/new`,
   `/campaigns/[id]/edit`), with a **live phone preview** of the comment reply
   and the DM conversation.
2. **Targeting**: a specific post (with a post picker that flags posts already
   in use), **any post**, or **the next reel** you publish (attached
   automatically by a cron).
3. **Keywords**: keyword chips, whole-word or partial match, or **any comment**.
4. **DM keyword trigger**: the campaign also fires when someone DMs a matching
   keyword.
5. **Opening DM with a button**: the first DM has a button; tapping it (or
   reading the message) reveals the link message. Two-link buttons with
   editable labels.
6. **Follow gate**: ask the person to follow before the link is delivered,
   with an editable prompt and button.
7. **Follow-up DM**: an optional thank-you DM, delayed 0 to 24 hours.
8. **Public comment reply**: reply publicly to the comment, rotating between
   several variations. Tracked separately from the DM, so a failed DM never
   blocks or repeats the public reply.
9. **Campaign detail page** (`/campaigns/[id]`): the campaign's settings,
   stats and recent activity.
10. **CSV import** (`/campaigns/import`): create many campaigns from a sheet,
    with skip and in-use post handling.
11. **Missed-comment recovery**: a poller that catches comments whose webhook
    never arrived, de-duplicated against webhook deliveries.

## Not in scope

openreply's Inbox, Overview and follower chart, its public site and demo
pages, and its removal of billing. Each can come later on its own.

## Decisions (my calls, open to change)

- **Every new feature is available on every plan.** Plan limits keep counting
  campaigns and DMs as today; nothing new is gated. Gating can be added later.
- **Existing campaigns keep working unchanged.** New columns default to "off",
  so a current campaign behaves exactly as now: one DM on a matching comment.
- **One database migration** adds the new campaign columns, the
  `ProcessedComment` table and the public-reply fields on `DmLog`. It applies
  itself on startup like the others.
- **InnoDB fix rides along.** The live database is MyISAM (the host's default),
  which has no transactions or row locks. The migration converts all tables to
  InnoDB, and new tables are created as InnoDB explicitly.
- **Code comes from openreply, merged with ReplyNxt's**, not rewritten: where a
  file exists in both (DM worker, webhook route, automations API), openreply's
  logic is merged in and ReplyNxt's billing, plan limits, tracked links and
  reports are kept. Styling follows ReplyNxt's current theme and brand.
- **Delivery:** its own branch and PR, after the current `feat/cpanel-package`
  work is committed. Tests are ported from openreply alongside each piece.

## Left to the builder

File-level merge order, the cron schedule for next-reel attachment and comment
polling (added to the cPanel cron list in `docs/deploy-cpanel.md`), and test
coverage for the merged paths.
