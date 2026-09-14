# Supabase Auth setup (email password + email OTP)

This app uses Supabase Auth directly from the client (`@supabase/supabase-js`).
No custom backend is involved. Do this once per Supabase project.

## 1. Enable the Email provider

Dashboard → **Authentication → Providers → Email**

- Turn the Email provider **on**.
- "Confirm email" (email confirmations):
  - **On** (default, recommended) — `signUp` will not return a session until
    the user clicks the confirmation link in their inbox. The Signup page in
    this app already handles that case ("Check your inbox" screen).
  - **Off** — `signUp` returns a session immediately, and the app will route
    straight to `/dashboard`.

## 2. Enable email OTP (magic code) sign-in

Email OTP uses the same Email provider — no separate toggle. Supabase sends
a 6-digit code (instead of only a magic link) when you call:

```js
supabase.auth.signInWithOtp({ email })
```

Dashboard → **Authentication → Email Templates → Magic Link** — the default
template includes `{{ .Token }}`, which is the code the user types on this
app's `/verify` screen. If you've customized the template, make sure the
`{{ .Token }}` variable is still present so users actually receive a code
(not just a clickable link they can't use here).

## 3. Redirect URLs / Site URL (for the confirmation email + any link-based flows)

Dashboard → **Authentication → URL Configuration**

- **Site URL**: your deployed Vercel URL (e.g. `https://your-app.vercel.app`),
  or `http://localhost:5173` while developing locally.
- **Redirect URLs**: add both your local dev URL and your Vercel production
  URL.

## 4. Rate limits (optional but recommended for a public demo)

Dashboard → **Authentication → Rate Limits** — the defaults are fine, but
since this project is a public portfolio piece, consider tightening the
"OTP requests per hour" limit so the project's email sending quota isn't
exhausted by strangers testing the demo.

## 5. Run the schema

Run `supabase/schema.sql` in the SQL editor before testing signup/login —
it creates the `payment_requests` table and RLS policies the app depends on.
