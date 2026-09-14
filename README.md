# KM Pay

> Personal practice project — not a live payment processor, not for public
> or production use. Every "transaction" is a row in a Postgres table (or,
> with no Supabase project connected, a browser-local mock) with a status
> field.

Built with React (Vite), Tailwind CSS, React Router, and Supabase
(Auth + Postgres + RLS). No custom backend server.

## Features

- `/register` — registers a payment request, generates a unique
  `TRX-XXXX-XXXX` tracking code.
- `/track/:code` — looks up a payment request's live status.
- `/checkout` — review → confirm (processing → success/failure) or cancel
  (immediate, distinct outcome). Every outcome updates the row's `status`.
- Supabase Auth: `/signup`, `/login` (email + password, then a one-time
  code), `/dashboard` (your own payment requests only, enforced by RLS).
- `/admin` — local-only viewer (passphrase-gated, see `VITE_ADMIN_PASSPHRASE`)
  listing submitted payment requests and registered account emails. Never
  displays passwords, in either mock or real mode.
- Light/dark theme toggle (top nav), respects OS preference until you pick
  one explicitly; choice persists in `localStorage`.

## Local mock mode (no Supabase project needed)

If `.env` has no `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, the app
automatically runs against `src/lib/mockBackend.js` instead of Supabase:
every page works — register, checkout, track, signup, login, dashboard,
admin — using `localStorage` as the "database" in your browser. On
`/login`, there's no real account to check credentials against, so the
password step always proceeds to a Terms & Conditions confirmation, a
loading state, then a verification-code step that accepts any input —
purely so you can exercise the full UI/data flow before wiring up a real
Supabase project. Set the two env vars any time to switch to real Supabase
password auth (real credential checks, real error messages) with no other
code changes.

## 1. Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Leave the Supabase vars in `.env` blank to use the local mock backend
above, or fill them in with your Supabase project's URL + anon key to use
a real database. The app runs at `http://localhost:5173`.

### Required environment variables

| Variable                  | Where to find it                                      |
| -------------------------- | ------------------------------------------------------ |
| `VITE_SUPABASE_URL`        | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY`   | Supabase Dashboard → Project Settings → API → anon public key |

Never put a `service_role` key in this project — it's a frontend-only app,
and the anon key plus RLS policies are what keep data access safe.

## 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `payment_requests` table and its Row Level Security
   policies (with a tradeoff note inline about anonymous vs. authenticated
   writes — read it before deploying anywhere semi-public).
3. Follow [`supabase/auth-setup.md`](supabase/auth-setup.md) to enable the
   Email provider (password auth + email OTP) and set your Site URL /
   Redirect URLs.
4. Copy your Project URL and anon key into `.env` (see above).

## 3. Deploying to Vercel

1. Push this repo to GitHub (or your Git provider of choice).
2. In Vercel, "Add New Project" → import the repo.
3. Framework preset: **Vite**.
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables in **Project Settings → Environment
   Variables**:
   - `VITE_SUPABASE_URL` (omit to deploy in local-mock mode — see caveat below)
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSPHRASE` (change this from the `admin123` default before
     deploying anywhere reachable by others)
5. Deploy. Once live, go back to your Supabase project's **Authentication →
   URL Configuration** and add the Vercel URL to Site URL / Redirect URLs
   (see `supabase/auth-setup.md`).

`vercel.json` (included in this repo) rewrites all paths to `index.html` so
client-side routes like `/track/TRX-XXXX-XXXX` don't 404 on a hard refresh.

**Mock-mode caveat:** if you deploy without Supabase env vars, every visitor
gets their own independent `localStorage` — there's no shared data between
visitors, sign-in accepts anything, and the admin passphrase is the only
thing gating `/admin`. That's fine for sharing a link to click through the
UI yourself; it is not a substitute for the real Supabase backend if you
want actual shared, persistent, or authenticated data.

## Project structure

```
src/
  lib/            Supabase client + local mock backend, currency list,
                  validation, tracking codes
  context/        Auth context (session state)
  components/     Shared UI: layout, nav, alerts, status badges
  pages/          Route-level pages (Landing, Register, Track, Checkout,
                  Signup, Login, Dashboard, Admin)
supabase/
  schema.sql      Table + RLS policies
  auth-setup.md   Dashboard steps for email/password + email OTP auth
```

## Notes on checkout

- Confirm and Cancel behave honestly differently: cancel short-circuits
  straight to a "Payment Canceled" screen, while confirm goes through
  review → processing → a randomized success/failure outcome.
- You can force an outcome for testing purposes with a query param:
  `/checkout?force=success` or `/checkout?force=fail`.
- Every terminal state (`completed`, `failed`, `canceled`) is written back
  to the corresponding `payment_requests` row.
