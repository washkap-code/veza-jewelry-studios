# VEZA — Founder Admin, Collection Scheduling, Payments Scaffold

## 1. Run this migration in Supabase SQL Editor

Open the Supabase dashboard for this project → **SQL Editor → New query** →
paste the full contents of [`founder_collections_payments.sql`](./founder_collections_payments.sql)
and run it.

The migration is idempotent — safe to re-run.

It does the following:

1. Adds `status`, `launch_at`, `teaser` columns to `public.collections`.
2. Adds `must_change_password` to `public.profiles`.
3. Creates `public.payment_settings` (singleton row, id = 1) with
   `payments_enabled` (default `false`) and `stripe_publishable_key` fields,
   plus RLS: public read, admin write.
4. Rewrites RLS for `collections` (public sees `coming_soon` + `live`;
   admins see `draft` too) and `products` (products only visible when the
   parent collection is `live`, or `coming_soon` with `launch_at <= now()`).
   This is the **server-side launch gate** — a product cannot leak before its
   collection's `launch_at`.
5. Seeds two collections as `coming_soon`, no launch dates, no products:
   - **Everyday & Corporate** (`/collections/everyday`)
   - **Fashion Week** (`/collections/fashion-week`)
   Khanyisile can add a second Fashion Week entry (e.g. `Fashion Week — Paris`)
   from Admin → Collections when the calendar is confirmed.
6. Creates the founder auth user directly in `auth.users`:
   - Email: `khanyisile@veza-studios.com`
   - Temporary password: `VezaAtelier#2026`
   - `profiles.is_admin = true`, `profiles.must_change_password = true`
   She will be routed to the **Change password** screen on first login and
   cannot enter the admin area until she sets a new password.

## 2. Payments — dormant until keys are provided

Everything is wired but off. To go live:

1. In Supabase → **Edge Functions → Secrets**, add `STRIPE_SECRET_KEY`
   (`sk_live_…` or `sk_test_…`).
2. Deploy the edge function:
   ```
   supabase functions deploy create-checkout-session --no-verify-jwt
   ```
3. Sign in as Khanyisile → **Admin → Settings**, paste the Stripe
   publishable key (`pk_live_…`), and toggle **Card payments** on.

Until both the toggle is on **and** the secret key is present, the
`create-checkout-session` function returns a clear `payments_not_enabled`
response and the checkout page continues to use the existing "order request"
flow verbatim.
