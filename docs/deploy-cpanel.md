# Deploying on cPanel

This guide runs ReplyNxt on a cPanel host with **Setup Node.js App**
(CloudLinux's Node.js Selector, served by Phusion Passenger). One Node app and
one MySQL database are the whole deployment: the job runtime that sends the DMs
starts inside the web app, and the queue lives in MySQL, so there is no Redis
and no second process to keep alive.

You build a self-contained zip on your own machine and upload it. Nothing is
built or installed on the server, which shared hosts rarely have the memory for.

## What you need

- cPanel with **Setup Node.js App**, offering **Node 22.12+ or 24+**.
  Prisma 7 and Next.js 16 refuse anything older. If the list stops at 18 or an
  early 20.x, ask your host for a newer Node; there is no workaround.
- **MySQL Databases** in cPanel, on MySQL 8. MariaDB is untested with the job
  queue's tables; if your host only offers MariaDB, check `/api/health` and a
  test DM carefully after setup.
- **Cron Jobs** in cPanel.
- Node and this repo on your own machine, to build the package.

## 1. Create the database

In cPanel, open **MySQL Databases**:

1. Create a database, for example `replynxt`. cPanel prefixes it with your
   account name, so it becomes something like `cpuser_replynxt`.
2. Create a user with a strong password, for example `cpuser_replynxt`.
3. Add the user to the database with **ALL PRIVILEGES**. The app creates its
   own tables on first start, so it needs `CREATE` and `ALTER`, not just read
   and write.

The app connects over localhost, so its connection string is:

```
DATABASE_URL=mysql://cpuser_replynxt:PASSWORD@localhost:3306/cpuser_replynxt
```

URL-encode special characters in the password (`@` becomes `%40`, `#` becomes
`%23`, `/` becomes `%2F`).

## 2. Migrations run themselves

There is nothing to run. The package starts with `MIGRATE_ON_START=true`, so
every time the app starts it applies any pending migrations from
`app/prisma/migrations` before serving (`lib/db/migrate-on-start.ts`). It
records them in Prisma's own `_prisma_migrations` table under Prisma's lock, so
`prisma migrate deploy` from your machine stays compatible if you ever use it.
The log shows `[Migrate] Applied N migration(s)` or `[Migrate] Database is up
to date`.

The job queue's own tables (`sidequest_*`) are created by the app as well.

## 3. Build the package

On your machine, in the repo:

```bash
npm ci
npm run package:cpanel
```

This writes `dist/replynxt-cpanel.zip` (about 21 MB). Its layout:

```
app.js          startup file Passenger runs
package.json    no dependencies, so cPanel's npm install has nothing to do
.env.example
app/            the built app, with only the node_modules it needs
```

The built app sits in `app/` because CloudLinux's Node.js Selector reserves
`node_modules` in the application root for a symlink into its own virtual
environment, and its module install fails if a real folder is there. Your local
`.env` is stripped out of the zip; the server gets its own settings in step 5.

## 4. Create the Node.js app

In cPanel, open **Setup Node.js App** and click **Create Application**:

| Field | Value |
| --- | --- |
| Node.js version | 22.12+ or 24+ |
| Application mode | Production |
| Application root | a folder in your home directory, for example `replynxt` |
| Application URL | the domain or subdomain to serve ReplyNxt on |
| Application startup file | `app.js` |

Click **Create**. You don't need **Run NPM Install**: the package already
contains its dependencies. Clicking it is harmless — the root `package.json`
lists none, so it finishes with nothing installed.

## 5. Upload and configure

1. Open **File Manager**, go to the application root (for example
   `/home/cpuser/replynxt`). If cPanel put a placeholder `app.js` there,
   delete it. Upload `replynxt-cpanel.zip`, **Extract** it there, then
   delete the zip. You should see `app.js`, `package.json` and an `app` folder.
   Leave alone any `node_modules` link cPanel created; the app does not use it.
2. Set the environment variables. Either add them under **Environment
   variables** on the app's page in **Setup Node.js App**, or create a `.env`
   file in the application root (copy `.env.example`, which is in the package).
   On cPanel:
   - `NEXTAUTH_URL`: `https://` plus the Application URL from step 4.
   - `DATABASE_URL`: the `localhost` URL from step 1.
   - `NEXTAUTH_SECRET`, `CRON_SECRET`: long random strings
     (`openssl rand -hex 32`).
   - `ENCRYPTION_KEY`: 64 hex characters (`openssl rand -hex 32`). Keep it
     forever: changing it makes every stored Instagram token unreadable.
   - Login email: `EMAIL_SERVER` (your SMTP URL) and `EMAIL_FROM`, or
     `RESEND_API_KEY` and `EMAIL_FROM`.
   - Meta: `META_GRAPH_API_VERSION`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`,
     `FACEBOOK_APP_SECRET`, `WEBHOOK_VERIFY_TOKEN`.
   - Billing, each optional — a provider whose variables are unset is hidden:
     `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`,
     `STRIPE_PRICE_AGENCY`; `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
     `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_PLAN_PRO`, `RAZORPAY_PLAN_AGENCY`.
   - Leave `RUN_JOBS` unset. The jobs run inside this app.
3. Back in **Setup Node.js App**, click **Restart**.

Open `https://replynxt.com/api/health`. It should report `"status":"ok"`,
with `worker.healthy: true`. The first request after a start or restart takes
a few seconds while Passenger boots the app.

## 6. Add the cron jobs

In cPanel, open **Cron Jobs**, set the cron email at the top of the page, and
add these three, with your domain and your `CRON_SECRET`:

```
*/5 * * * *   curl -fsS -m 60 https://replynxt.com/api/health > /dev/null
0 5 * * *     curl -fsS -m 180 -H "Authorization: Bearer YOUR_CRON_SECRET" https://replynxt.com/api/cron/refresh-tokens > /dev/null
*/10 * * * *  curl -fsS -m 120 -H "Authorization: Bearer YOUR_CRON_SECRET" https://replynxt.com/api/cron/attach-next-reel > /dev/null
```

- **Every 5 minutes, `/api/health`**: keeps the app awake. Passenger shuts an
  app down after a few idle minutes and starts it again on the next request.
  While it is down, due jobs (rate-limit retries, delayed sends) wait in MySQL
  — nothing is lost — and run as soon as it starts. This keeps that wait under
  five minutes. It also alerts you: `/api/health` answers 503 when the
  database, queue or worker is unhealthy, so `-f` makes curl fail and cPanel
  emails you.
- **Daily at 05:00, `/api/cron/refresh-tokens`**: refreshes Instagram tokens
  before they expire and resets monthly DM usage. Without it every campaign
  stops without an error once a token expires. It is the job `vercel.json`
  schedules on Vercel.
- **Every 10 minutes, `/api/cron/attach-next-reel`**: Instagram sends no
  event when you publish, so this looks for your newest reel and attaches
  any "next reel" campaign to it. A campaign goes live within ten minutes of
  the reel being posted.

Successful runs stay quiet; only failures send email.

## 7. Point the webhooks at your domain

Each provider needs your cPanel domain in place of a Vercel or tunnel URL:

| Provider | Where | URL |
| --- | --- | --- |
| Meta | App dashboard → Webhooks, and the Instagram OAuth redirect | `https://replynxt.com/api/webhook`, redirect `https://replynxt.com/api/instagram/callback` |
| Stripe | Developers → Webhooks | `https://replynxt.com/api/stripe/webhook` |
| Razorpay | Account & Settings → Webhooks, all `subscription.*` events, secret = `RAZORPAY_WEBHOOK_SECRET` | `https://replynxt.com/api/razorpay/webhook` |

The events each one needs are in [DEPLOYMENT.md](../DEPLOYMENT.md).

## Updating

1. `git pull`. New migrations are applied by the app when it restarts.
2. `npm run package:cpanel`.
3. In File Manager, delete the application root's `app` folder (old build
   files otherwise linger next to the new ones), then upload and extract the
   new zip. Your `.env` is not in the zip, so it survives.
4. **Restart** the app in **Setup Node.js App**.

## Troubleshooting

**`/api/health` says a table "does not exist".** The startup migrations did not
run or failed. The log shows `[Migrate] Failed` with the reason — usually a
database user without `CREATE`/`ALTER` rights (step 1). Fix it and restart.

**"An error occured during installation of modules. Web application is
inaccessible".** The application root holds a real `node_modules` folder,
which the Node.js Selector refuses. That happens after extracting the zip
somewhere other than its root. Delete everything in the application root
except `.env`, extract a freshly built zip, and restart.

**The site shows a generic Passenger or 503 error.** Look at the app's log. On
most CloudLinux hosts that is `stderr.log` in the application root; otherwise
your host can tell you where Passenger writes it. A Node version that is too old
logs `[ReplyNxt] Node X is too old` there.

**`worker.healthy` is false in `/api/health`.** The job runtime is not running.
The log shows `[DM Worker] Started` on a good start, or `Failed to start job
runtime` with the reason. The usual reasons are a wrong `DATABASE_URL` or a
database user without `CREATE`/`ALTER` (step 1). Webhooks are still accepted
and queued meanwhile; the queued DMs go out once the runtime starts.

**The app keeps restarting or gets killed.** Shared plans cap memory per
account (CloudLinux LVE limits). Allow at least 512 MB; if the limit is lower,
ask your host to raise it, or move to a plan that allows it.

**Duplicate DMs.** Something else is running the job runtime against the same
database (an old worker, or a second copy of the app). Stop it, or set
`RUN_JOBS=false` on every copy but one.
