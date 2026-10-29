# Campaign Builder Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring openreply's campaign system (builder, preview, targeting, opening DM, follow gate, follow-up, public replies, DM trigger, detail page, CSV import, missed-comment polling) into ReplyNxt without losing ReplyNxt's goal, templates, tracked links, reports, plan limits and billing.

**Architecture:** openreply (`../openreply`) is this codebase plus the campaign features minus billing. Every shared file keeps the same function names and signatures (`reserveWorkspaceDMSend`, `reserveDMSlot`, `getDMQueue`, ...), so each task copies openreply's version of a file and re-applies the ReplyNxt-only lines listed in that task. New files are copied as-is. Brand strings stay ReplyNxt (`__replynxtSidequestJobs`, no "Flowly").

**Tech Stack:** Next.js 16.2.6, Prisma 7.8 on MySQL 8 (`@prisma/adapter-mariadb`), Sidequest 1.17, Vitest, Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-10-29-campaign-builder-port-design.md`

## Global Constraints

- Every new campaign option defaults to off; an existing campaign behaves exactly as today (one DM on a matching comment on its post).
- Plan limits stay enforced: `maxAutomations` on create, `maxDMsPerMonth` through `lib/billing/usage.ts` (ReplyNxt's version, never openreply's uncapped one), `maxInstagramAccounts` on connect.
- Keep ReplyNxt's `RATE_LIMIT_MAX = 190` in `lib/utils/rate-limiter.ts`; do not take openreply's 750.
- Keep `lib/reports/share.ts`, `lib/reports/data.ts`, `lib/instagram-accounts.ts`, `lib/billing/*`, `lib/meta/oauth.ts` and `app/api/dashboard/stats/route.ts` as ReplyNxt has them.
- No Inbox, Overview, follower snapshots/chart, `instagram_business_manage_insights` scope, or public-site pages from openreply.
- The global job registry stays `globalThis.__replynxtSidequestJobs` in both `lib/jobs/dm-job.ts` and `sidequest.jobs.mjs`.
- `npx tsc --noEmit`, `npm run lint` and `npx vitest run` pass at the end of every task.

## Review Focus

1. A campaign created before the migration (postId set, every new flag off) still sends exactly one DM to a matching comment, and nothing else (no public reply, no opening DM). Test in Task 4.
2. A workspace at its monthly DM cap gets `SKIPPED_PLAN_LIMIT` on every new path (opening DM postback reveal, DM trigger), not only on comments. Test in Task 4.
3. A FREE workspace at `maxAutomations` gets 403 from both `POST /api/automations` and `POST /api/automations/import`. Test in Task 6.
4. A database whose tables are MyISAM with no foreign keys ends up InnoDB with every foreign key from the migrations, without losing rows; a database already InnoDB is left untouched. Test in Task 2.
5. The same comment arriving by webhook and by the poller produces one DM, not two. Test in Task 5.

---

### Task 1: Schema and migration for the new campaign fields

**Files:**
- Modify: `prisma/schema.prisma` (models `Automation`, `DmLog`; new model `ProcessedComment`)
- Create: `prisma/migrations/<timestamp>_campaign_builder/migration.sql`

**Interfaces:**
- Produces: `Automation` gains exactly openreply's columns: `postId String?` (now optional), `pendingNextReel Boolean @default(false)`, `matchAnyPost Boolean @default(false)`, `matchAnyWord Boolean @default(false)`, `dmTriggerEnabled Boolean @default(false)`, `openingDmEnabled Boolean @default(false)`, `openingDmMessage String? @db.Text`, `openingDmButtonLabel String?`, `linkButtonLabel String?`, `requireFollow Boolean @default(false)`, `followPromptMessage String? @db.Text`, `followPromptButtonLabel String?`, `followUpEnabled Boolean @default(false)`, `followUpMessage String? @db.Text`, `followUpDelayMinutes Int @default(0)`, `publicReplyEnabled Boolean @default(false)`, `publicReplyMessage String? @db.Text`, `publicReplyMessages Json @default("[]")`. `goal` stays. `DmLog` gains `publicReplySentAt DateTime?`, `publicReplyError String? @db.Text`. `ProcessedComment` is copied verbatim from `../openreply/prisma/schema.prisma`.

- [ ] **Step 1:** Edit the schema as above (copy the field comments from openreply's schema).
- [ ] **Step 2:** Generate the SQL with `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script` against a shadow DB, save it as the new migration, and apply with `npx prisma migrate dev` on the local MySQL (port 3308). Expected: migration applies; `npx prisma generate` succeeds.
- [ ] **Step 3:** Run typecheck. Expected failures only where code assumed `postId: string` (fixed in later tasks); note them, do not patch yet.
- [ ] **Step 4:** Commit `feat(db): add campaign builder fields`.

### Task 2: Startup storage-engine repair (MyISAM → InnoDB, missing foreign keys)

**Files:**
- Create: `lib/db/repair-storage-engine.ts`
- Modify: `lib/db/migrate-on-start.ts` (call the repair after migrations, same lock), `instrumentation.ts` only if the call site needs it
- Test: `__tests__/repair-storage-engine.test.ts`

**Interfaces:**
- Produces: `repairStorageEngine(conn: { query(sql: string, params?: unknown[]): Promise<unknown[]> }, migrationsDir: string): Promise<{ converted: string[]; foreignKeysAdded: string[] }>`
- Also: `parseForeignKeyStatements(sql: string): Array<{ table: string; name: string; statement: string }>` (exported for tests).

- [ ] **Step 1: Write failing tests** with a fake `conn`:
  - `parseForeignKeyStatements` on the baseline migration text returns every `ALTER TABLE \`X\` ADD CONSTRAINT \`Y\` FOREIGN KEY ...;` with table `X`, name `Y`.
  - Given `information_schema.TABLES` rows with `ENGINE='MyISAM'` for `Automation` and `sidequest_jobs`, it issues `ALTER TABLE \`Automation\` ENGINE=InnoDB` and the same for `sidequest_jobs`, and returns them in `converted`.
  - Given `information_schema.REFERENTIAL_CONSTRAINTS` already containing `Automation_workspaceId_fkey`, that statement is not run; a missing one is run and listed in `foreignKeysAdded`.
  - All tables already InnoDB and all constraints present → no ALTER issued, both arrays empty.
  - A failing `ADD CONSTRAINT` (orphan rows) is logged with `[Migrate]` and does not throw.
- [ ] **Step 2:** Run `npx vitest run __tests__/repair-storage-engine.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3:** Implement. Queries are scoped to `DATABASE()`. Read every `migration.sql` under `migrationsDir` in name order. Log `[Migrate] Converted N table(s) to InnoDB` and `[Migrate] Added N foreign key(s)` only when non-zero. Also run `SET SESSION default_storage_engine=InnoDB` on the migration connection before applying migrations, so new tables are InnoDB on hosts whose default is MyISAM.
- [ ] **Step 4:** Run the tests. Expected: PASS. Run `__tests__/migrate-on-start.test.ts`. Expected: PASS.
- [ ] **Step 5:** Commit `fix(db): convert MyISAM tables to InnoDB and restore foreign keys at startup`.

### Task 3: Shared library ports (matching, messages, Meta client, webhook parsing, job types)

**Files:**
- Modify (take openreply's version, re-apply listed lines):
  - `lib/utils/keyword-matcher.ts` (take as-is: Unicode matching)
  - `lib/tracking/message.ts` (adds `renderMessageWithoutLink`)
  - `lib/tracking/analytics.ts` (CTR capped at 100)
  - `lib/meta/client.ts` (adds button-template sends, comment replies, follow check, `getAllUserMedia`, profile; keep `user_id` in `getUserInfo` fields)
  - `lib/meta/webhook.ts` (adds `parsePostbackEvents`, `parseMessageEvents`, `parseReadEvents`, `originalMediaId`, own-comment skip; keep the two-secret signature check)
  - `lib/queue/client.ts` (adds `DmQueueJob`, `POSTBACK_JOB_NAME`, `FOLLOWUP_JOB_NAME`, `MESSAGE_JOB_NAME`, `CommentSource`)
  - `lib/jobs/dm-job.ts` (routes to `processJob`; keep `__replynxtSidequestJobs`)
- Test: take openreply's `__tests__/keyword-matcher.test.ts`, `__tests__/tracking.test.ts`, `__tests__/webhook.test.ts`, then re-add ReplyNxt's two signature tests and `replynxt.com` URLs.

**Interfaces:**
- Produces: `processJob(job: Job<DmQueueJob>)` is imported by `lib/jobs/dm-job.ts` from `lib/queue/dm-worker.ts` (implemented in Task 4); every exported name above matches openreply exactly.

- [ ] **Step 1:** Copy the tests; run them. Expected: FAIL on the new parsers and Unicode cases.
- [ ] **Step 2:** Copy and merge the source files.
- [ ] **Step 3:** Run the three test files. Expected: PASS. (Typecheck still fails until Task 4 exports `processJob`.)
- [ ] **Step 4:** Commit `feat: port campaign matching, message and Meta client helpers`.

### Task 4: DM worker with every campaign path

**Files:**
- Modify: `lib/queue/dm-worker.ts` (replace with openreply's version)
- Test: `__tests__/dm-worker.test.ts` (openreply's version plus the cases below)

**Interfaces:**
- Consumes: Task 3 exports; ReplyNxt's `reserveWorkspaceDMSend`, `releaseWorkspaceDMReservation`, `incrementWorkspaceDMUsage` (unchanged signatures).
- Produces: `processJob`, `recordWorkerFailure` (same names `lib/jobs/dm-job.ts` imports).

- [ ] **Step 1:** Copy openreply's worker test; add:
  - `legacy campaign sends one plain DM and nothing else`: automation with postId and every new flag false; a matching comment calls `sendPrivateReply` once with the rendered `dmMessage` and never calls the comment-reply or button-template senders.
  - `postback reveal respects the monthly cap`: `reserveWorkspaceDMSend` resolves `{ allowed: false, limit: 100 }`; `processJob` for a `process-postback` job upserts `SKIPPED_PLAN_LIMIT` and sends nothing.
  - `DM trigger respects the monthly cap`: same for `process-message`.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Copy openreply's `lib/queue/dm-worker.ts`. Keep imports pointing at ReplyNxt's `lib/billing/usage.ts`.
- [ ] **Step 4:** Run `npx vitest run __tests__/dm-worker.test.ts __tests__/usage.test.ts` then the full suite and `npx tsc --noEmit`. Expected: PASS except call sites still assuming `postId: string` in routes/pages (Task 6/7).
- [ ] **Step 5:** Commit `feat(worker): opening DM, follow gate, follow-up, public replies and DM trigger`.

### Task 5: Webhook route and missed-comment poller

**Files:**
- Modify: `app/api/webhook/route.ts` (openreply's version), `lib/jobs/runtime.ts` (add the poll timer; keep `COMMENT_POLL_INTERVAL_MS`, default 5 minutes)
- Create: `lib/polling/comment-reconciler.ts` (copy)
- Test: `__tests__/comment-reconciler.test.ts`

**Interfaces:**
- Produces: `reconcileComments(): Promise<void>`; webhook enqueues `process-comment`, `process-postback`, `process-message` and read-receipt reveals with the job keys openreply uses; both paths record `ProcessedComment` so one comment is enqueued once.

- [ ] **Step 1:** Write `__tests__/comment-reconciler.test.ts`: with `prisma.processedComment.create` rejecting a unique-violation for comment `c1` (already seen by webhook) and the Meta comments fetch returning `c1` and `c2`, `reconcileComments()` enqueues only `c2`, with `source: "POLLING"`.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Copy the reconciler and webhook route; add the timer to the runtime.
- [ ] **Step 4:** Run the test, the webhook tests and the full suite. Expected: PASS.
- [ ] **Step 5:** Commit `feat: route postbacks, DMs and read receipts; poll for missed comments`.

### Task 6: Campaign APIs, import and next-reel cron

**Files:**
- Modify: `app/api/automations/route.ts` (openreply's schema and handlers merged with ReplyNxt's `goal`, plan-limit check on POST and the `trackedDestinationUrl` create), `app/api/instagram/posts/route.ts` (adds `all=true`)
- Create (copy): `app/api/automations/import/route.ts` (add the same plan-limit check, counting the rows to be created), `app/api/instagram/profile/route.ts`, `app/api/cron/attach-next-reel/route.ts`
- Modify: `vercel.json` (attach-next-reel schedule as in openreply), `docs/deploy-cpanel.md` (third cron line: every 10 minutes, `curl -fsS -m 120 -H "Authorization: Bearer YOUR_CRON_SECRET" https://replynxt.com/api/cron/attach-next-reel > /dev/null`)
- Test: `__tests__/automations-routes.test.ts`

- [ ] **Step 1:** Write tests: FREE workspace with 1 campaign → `POST /api/automations` 403 with the "Plan limit reached" message; `POST /api/automations/import` with 2 rows → 403; PRO workspace creating a campaign with `matchAnyPost: true` and no `postId` → 200 and `goal` saved; `PATCH` keeps `goal` when omitted.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement the merge and copies.
- [ ] **Step 4:** Run tests, typecheck, lint. Expected: PASS except UI pages (Task 7).
- [ ] **Step 5:** Commit `feat(api): campaign builder fields, CSV import, next-reel attachment`.

### Task 7: Campaign UI

**Files:**
- Create (copy): `components/campaign-builder.tsx`, `components/campaign-preview.tsx`, `components/account-select.tsx`, `lib/client-cache.ts`, `lib/import-queue.ts`, `lib/utils/csv.ts` (+ `__tests__/csv.test.ts`), `app/(dashboard)/campaigns/[id]/page.tsx`, `app/(dashboard)/campaigns/[id]/edit/page.tsx`, `app/(dashboard)/campaigns/import/page.tsx`
- Modify: `components/post-picker.tsx`, `components/keyword-input.tsx` (openreply's versions), `app/(dashboard)/campaigns/page.tsx` (openreply's list, keeping ReplyNxt's report-link and analytics columns), `app/(dashboard)/campaigns/new/page.tsx` (renders `<CampaignBuilder mode="new" />` inside `<Suspense>` for `useSearchParams`)
- ReplyNxt additions to `components/campaign-builder.tsx`: a required **Goal** select using the existing goal options from the current new-campaign page; `?template=<slug>` prefill from `getCampaignTemplate` (name, goal, keywords, dmMessage, tracked link) in new mode; the 403 plan-limit message shown as the save error.

- [ ] **Step 1:** Copy `__tests__/csv.test.ts`; run. Expected: FAIL. Copy `lib/utils/csv.ts`; run. Expected: PASS.
- [ ] **Step 2:** Copy and merge the components and pages.
- [ ] **Step 3:** Full verification: `npx tsc --noEmit`, `npm run lint`, `npx vitest run`. Expected: all pass.
- [ ] **Step 4:** Run the dev server against local MySQL and check in the browser: create a campaign from `/templates` (goal and fields prefilled), create one with opening DM + follow gate + follow-up + public replies (preview updates live), edit it, open its detail page, import a 2-row CSV, and confirm the FREE plan-limit error appears on the second campaign.
- [ ] **Step 5:** Commit `feat(ui): openreply campaign builder with ReplyNxt goals and templates`.

### Task 8: Package and ship

- [ ] **Step 1:** `npm run package:cpanel`; extract into an empty folder; run against an empty database. Expected: `[Migrate] Applied 4 migration(s)`, health OK.
- [ ] **Step 2:** Run once more against a database whose tables were converted to MyISAM (`ALTER TABLE ... ENGINE=MyISAM` on a copy). Expected: `[Migrate] Converted N table(s) to InnoDB`, `[Migrate] Added N foreign key(s)`, health OK.
- [ ] **Step 3:** Copy the zip to `~/Desktop/replynxt-cpanel.zip`; push the branch; open the PR.
