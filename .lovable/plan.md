# VEZA 2026 Brochure & Platform Update — Delivery Plan

This is a very large scope (roughly 8 substantial features, plus content restructuring and a QA pass). To ship it responsibly without silently cutting corners or producing "looks-done-but-broken" work, I'd like to confirm scope and split delivery into phases. Please review and tell me to proceed as-is, reorder, or trim.

## Assumption I'll lock in unless corrected
- 9k gold and silver prices in the brochure are stored as **two variants per product** (metal = 9k gold / silver), not as separate products. Product cards display "from $X" with a metal selector on the detail page.
- "From" prices under **VEZA JEWELRY (bespoke)** are shown as guide prices with a "Bespoke — final quote on request" note; checkout for these routes to commission flow, not direct add-to-cart.
- **Analytics**: lightweight self-hosted only (page_view / product_view / add_to_cart / order events into a Supabase `analytics_events` table with basic aggregation). No GA/Plausible.
- **Shipping rates**: I will seed a zone table (Africa / EU / UK / North America / Middle East / Asia / Oceania / Rest of World) × 5 couriers with **clearly placeholder values flagged "TBC — confirm with courier"**, and the buyer-facing quote is labelled "Estimated shipping — confirmed at dispatch". Real rates require your courier accounts.
- **Admin login page**: separate route `/studio` with the same Supabase auth but a distinct minimalist UI; small "Studio access" link in the footer of `/account`. Non-admin sign-ins there are redirected to `/account`.
- **AI Refine**: uses `LOVABLE_API_KEY` via `google/gemini-2.5-flash` through a `createServerFn` — admin sees a diff/preview and must click Save.
- **Image gallery seeding**: I'll register existing `public/images/**` files as gallery rows pointing to their public paths (no re-upload to storage for the seeded ones), then all new uploads go into a `gallery` Supabase Storage bucket.

## Phased delivery (each phase is a shippable checkpoint)

### Phase 1 — Foundations (schema + carry-over fixes)
- Verify khanyisile admin migration actually applied; re-apply if not.
- New migrations:
  - `product_variants` (metal, price, sku) + backfill.
  - `product_images` order + enforce 1–6 via check + trigger.
  - `gallery_images` (path, url, hash unique, alt, width, height, size, source).
  - `shipping_zones`, `shipping_couriers`, `shipping_rates` (admin-editable, TBC-flagged).
  - `analytics_events` (event, path, session_id, product_id, referrer, ts).
  - `orders` extension: `is_abandoned`, `courier_id`, `tracking_number`, `status_history jsonb`, `shipping_cost`, contact snapshot.
  - Rename fashion collection slug + set `launch_at = 2026-09-10T00:00:00+02:00`.
- Grants + RLS for all new tables.

### Phase 2 — Content restructure (authoritative brochure copy)
- Rewrite `/story` with brochure copy verbatim (VEZA = to carve, women-led, etc.).
- Seed collections **Nyika Brooch**, **Nyika Cufflinks**, **VEZA Jewelry** as **live**, each with the exact products/prices listed. Placeholder brand-toned images (sage-tint w/ VEZA mark) generated once and reused per product until real photos land.
- Update Gemstone Library to the 12 muses (add Mtoralite, Pale Citrine, Smokey Quartz, etc.), each with the brochure descriptor. Section intro: "Zimbabwe is home to over 60 minerals."
- `/custom`: add "Define your cut & shape" educational block (Pear/Round/Emerald/Cushion/Baguette/Cabochon).
- Contact number +263 777 602 761 wired into order/commission CTAs.

### Phase 3 — Sharing + SEO metadata
- Reusable `<ShareButton>` popover (Instagram note, FB, X, WhatsApp, Pinterest, Copy) + `navigator.share` on mobile.
- Per-product and per-journal `head()` — og:title, og:description, og:image (absolute URL), twitter:card.

### Phase 4 — Admin Media Gallery
- `/admin/gallery` route: drag-drop, batches ≤20, client-side resize (max 1920px) → WebP q80 with JPEG fallback, thumbnail generation, SHA-256 hash dedupe (skip + toast), alt-text edit, delete, search.
- Supabase Storage bucket `gallery` (public read, admin write).
- Seed rows for every file in `public/images/**`.
- New `<GalleryPicker>` used inside Products / Journal / Collections editors (multi-select + drag-reorder).

### Phase 5 — Product rules + AI Refine
- Enforce 1–6 photos and required description before publish (client validation + DB check).
- "Refine with AI" button in product and journal editors → server fn → Lovable AI → diff view → Save.

### Phase 6 — Buyer portal + shipping quote engine
- Cart → Delivery (destination + weight → matrix quote across 5 couriers, buyer picks) → Payment (Stripe if enabled, else Order Request with identical breakdown).
- Account: order history, status timeline (received → in production → dispatched → delivered) + courier tracking number, commission requests from within account.
- Abandoned-cart capture: on email entry + step transition, upsert an `orders` row with `is_abandoned=true`.

### Phase 7 — Admin additions
- Orders view split: Active / Abandoned tabs.
- Commissions inbox (already exists — polish + reply status).
- Analytics dashboard reading `analytics_events` (top pages, referrers, funnel counts, destination + courier breakdown). Real events only.
- `/studio` discreet admin login route + tiny "Studio access" link on `/account`.

### Phase 8 — Legal + QA
- `/privacy` and `/terms` drafted for a Zim-based international jewellery studio (orders, bespoke, payments, returns, data). Marked "Draft — subject to review".
- Footer links.
- Typecheck + Playwright verification of: collection index (3 live + 2 coming soon), IFW countdown, share popover, gallery dedupe/compression, 1–6 rule, shipping quote flow, abandoned order in admin, analytics events recording, `/studio` discreet.

## Technical notes
- All new server logic via `createServerFn` — no new Supabase Edge Functions except the existing Stripe one.
- Client-side image processing with `<canvas>` + `crypto.subtle.digest('SHA-256')` — no extra deps.
- Analytics: single lightweight `logEvent()` hook fired in the router root + product page + cart hooks. No PII beyond a rotating session id in `sessionStorage`.
- Placeholder product images: 1 generated master + per-collection tint; not 10 separate generations, to stay efficient.
- Migration is one file; I will paste it into `docs/migrations/` and also apply via the supabase migration tool so it actually runs on your DB (not "you need to run this manually").

## What I need from you
1. **Approve the plan** (or tell me which phases to drop/defer).
2. **Confirm the variant-per-metal assumption** for 9k gold vs silver pricing.
3. **Confirm placeholder shipping rates are acceptable** (flagged TBC) until you supply real courier rate cards.
4. Anything about the brochure I've misread.

Once approved I'll execute phases 1 → 8 and report back with a single consolidated summary + anything that still needs your input (courier rates, product photography, real Stripe key).