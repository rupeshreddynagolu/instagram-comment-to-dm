# CampaignCue Production Deployment

The web app and the DM job runtime can run as one Node process: on `next start`, `instrumentation.ts` starts the Sidequest engine in-process. Jobs, the hourly rate limiter, and the worker heartbeat all live in MySQL (or MariaDB), so no Redis is needed.

On a serverless host like Vercel the runtime cannot stay up, so run it as two services:

- **Web/API**: Next.js on Vercel, with `RUN_JOBS=false`.
- **Worker**: a persistent Railway service running `npm run worker`.

Provision MySQL on Railway or another managed provider and share it between both services.

## Required Environment Variables

Copy `.env.example` and set every value in Vercel and Railway:

- `DATABASE_URL` (a `mysql://` connection string)
- `RUN_JOBS` (set to `false` on the web app when the worker runs separately)
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `CRON_SECRET`
- `ENCRYPTION_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_AGENCY`
- `META_GRAPH_API_VERSION`
- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`
- `FACEBOOK_APP_SECRET`
- `WEBHOOK_VERIFY_TOKEN`

`ENCRYPTION_KEY` must be 64 hex characters. Generate one with:

```bash
openssl rand -hex 32
```

## Database

Run migrations before starting production traffic. Sidequest creates and migrates its own `sidequest_*` tables on first start.

```bash
npm ci
npm run db:generate
npm run db:migrate
```

## Vercel Web/API

1. Create a Vercel project from this repository.
2. Add all environment variables, including `RUN_JOBS=false`.
3. Set the production domain as `NEXTAUTH_URL`.
4. Deploy.
5. Vercel Cron will call `/api/cron/refresh-tokens` daily using `vercel.json`.

## Railway Worker

Create a second Railway service from the same repository.

Start command:

```bash
npm run worker
```

Use the same `DATABASE_URL`, Meta, Stripe, and encryption environment variables as the Vercel app. `ENCRYPTION_KEY` must match: the web app encrypts Instagram tokens and the worker decrypts them.

## Stripe

1. Create monthly subscription prices for Pro and Agency.
2. Put the price IDs into `STRIPE_PRICE_PRO` and `STRIPE_PRICE_AGENCY`.
3. Add a webhook endpoint pointing to:

```text
https://your-domain.com/api/stripe/webhook
```

Subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Meta

Configure the webhook callback URL:

```text
https://your-domain.com/api/webhook
```

Use `WEBHOOK_VERIFY_TOKEN` as the verify token. Public customer launch requires Meta App Review for Instagram messaging/comment permissions.
