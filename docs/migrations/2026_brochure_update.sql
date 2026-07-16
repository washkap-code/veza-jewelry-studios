-- =============================================================================
-- VEZA — 2026 Brochure Update
-- Run this in the Supabase SQL Editor. Safe to re-run (idempotent).
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 0. Carry-over: rename "fashion-week" collection + set countdown to 10 Sep 2026
-- ---------------------------------------------------------------------------
update public.collections
   set name = 'International Fashion Week Collection',
       slug = 'international-fashion-week-collection',
       teaser = 'Two capsules made for New York & London Fashion Weeks — released on the first day of the season.',
       status = 'coming_soon',
       launch_at = '2026-09-10T00:00:00+02:00'
 where slug in ('fashion-week', 'international-fashion-week-collection');

-- ---------------------------------------------------------------------------
-- 1. Products: brochure metadata column (metal pricing + bespoke flag)
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Enforce 1..6 images at DB level (soft: only when published)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_image_count_check'
  ) then
    alter table public.products
      add constraint products_image_count_check
      check (
        not published
        or (
          images is not null
          and jsonb_typeof(images) = 'array'
          and jsonb_array_length(images) between 1 and 6
          and coalesce(length(trim(description)), 0) > 0
        )
      ) not valid;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Brochure collections + products (Nyika Brooch, Nyika Cufflinks, VEZA Jewelry)
-- ---------------------------------------------------------------------------
insert into public.collections (name, slug, description, story, sort_order, published, status, teaser)
values
  ('The Nyika Brooch',
   'nyika-brooch',
   'Wearable art from 100% locally sourced Zimbabwean gemstones and precious metals — a distinguished gift for diplomats and dignitaries.',
   'Nyika means land, or country. The Nyika Brooch is Zimbabwe made small enough to wear over the heart.',
   1, true, 'live', null),
  ('The Nyika Cufflinks',
   'nyika-cufflinks',
   'Cufflinks that carry heritage — Mutupo animal totems, the Zimbabwe Bird, and gemstones native to the country.',
   null,
   2, true, 'live', null),
  ('VEZA Jewelry',
   'veza-jewelry',
   'Bespoke fine jewellery — every piece custom made for the wearer''s stone, metal, design and sizing.',
   'Intentional simplicity: nothing decorative for its own sake, nothing that does not serve the stone.',
   3, true, 'live', null)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  story = coalesce(public.collections.story, excluded.story),
  sort_order = excluded.sort_order,
  published = true,
  status = 'live';

-- Helper to insert a brochure product idempotently.
create or replace function public.__veza_upsert_product(
  p_slug text, p_name text, p_collection_slug text, p_stone text,
  p_desc text, p_price_silver numeric, p_price_gold numeric,
  p_is_bespoke boolean default false
) returns void language plpgsql as $$
declare v_cid uuid;
begin
  select id into v_cid from public.collections where slug = p_collection_slug;
  insert into public.products (
    collection_id, name, slug, description, price, currency, stone,
    materials, published, featured, stock_quantity, images, metadata
  ) values (
    v_cid, p_name, p_slug, p_desc, p_price_silver, 'USD', p_stone,
    '925 Sterling Silver / 9ct Gold', true, false, 0, '[]'::jsonb,
    jsonb_build_object(
      'price_silver', p_price_silver,
      'price_gold', p_price_gold,
      'is_bespoke', p_is_bespoke,
      'metal_options', array['925 Sterling Silver','9ct Gold']
    )
  )
  on conflict (slug) do update set
    collection_id = excluded.collection_id,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    stone = excluded.stone,
    materials = excluded.materials,
    metadata = excluded.metadata;
end $$;

-- A) The Nyika Brooch
select public.__veza_upsert_product(
  'zimbabwe-flag-brooch', 'Zimbabwe Flag Brooch', 'nyika-brooch',
  'Tsavorite, red garnet, citrine, black tourmaline, clear quartz',
  'A flat-profile brooch reimagining the Zimbabwean flag: architectural channels of tsavorites, red garnets, citrines and black tourmaline, with a clear quartz pavé chevron and a hand-carved Zimbabwe Bird as focal point.',
  550, 920, false);

select public.__veza_upsert_product(
  'flame-lily-brooch', 'Flame Lily Brooch', 'nyika-brooch',
  'Red garnet, green gemstone, yellow citrine',
  'A gender-neutral reimagining of Zimbabwe''s national flower — marquise-cut red garnets fan like petals around a cushion-cut green gemstone heart, lit by yellow citrine accents.',
  450, 950, false);

select public.__veza_upsert_product(
  'heritage-star-brooch', 'Heritage Star Brooch', 'nyika-brooch',
  'Enamel, gemstone accent',
  'The Zimbabwe Bird in polished gold set against a deep red enamel five-pointed star, with chain detailing and a single gemstone at the bird''s eye.',
  200, 450, false);

-- B) The Nyika Cufflinks
select public.__veza_upsert_product(
  'gemstone-cufflinks', 'Gemstone Cufflinks', 'nyika-cufflinks',
  'Deep blue Zimbabwean gemstone',
  'A deep blue cushion-cut gemstone set as a study in quiet luxury. Stones native to Zimbabwe.',
  180, 450, false);

select public.__veza_upsert_product(
  'mutupo-cufflinks', 'Mutupo Cufflinks', 'nyika-cufflinks',
  null,
  'A high-relief Shumba (lion) design honouring the Mutupo tradition — customisable to any totem: kudu, elephant, buffalo, zebra and more.',
  150, 450, false);

select public.__veza_upsert_product(
  'zimbabwe-bird-cufflinks', 'Zimbabwe Bird Cufflinks', 'nyika-cufflinks',
  null,
  'An embossed Zimbabwe Bird on a polished square face with rounded edges. Heritage, worn discreetly.',
  120, 380, false);

-- C) VEZA Jewelry (bespoke)
select public.__veza_upsert_product(
  'womens-gemstone-ring', 'Women''s Gemstone Ring', 'veza-jewelry',
  'The 2026 gemstone muses',
  'A bespoke women''s gemstone ring made to the wearer''s stone, cut and finger. Pear, round or cushion cuts across the 2026 gemstone muses. Guide pricing — final quote on request.',
  180, 400, true);

select public.__veza_upsert_product(
  'gemstone-pendant', 'Gemstone Pendant', 'veza-jewelry',
  'The 2026 gemstone muses',
  'A bespoke pendant pairing a regional stone cut with a chain of your choosing. Guide pricing — final quote on request.',
  150, 420, true);

select public.__veza_upsert_product(
  'mens-gemstone-ring', 'Men''s Gemstone Ring', 'veza-jewelry',
  'Aquamarine, clear quartz, black tourmaline',
  'A men''s ring of defined structure — geometric baguette-set signet styles in aquamarine, clear quartz or black tourmaline. Guide pricing — final quote on request.',
  180, 400, true);

select public.__veza_upsert_product(
  'mutupo-pendant', 'Mutupo Pendant', 'veza-jewelry',
  null,
  'An animal totem pendant on a silver chain — kudu, elephant, buffalo, chimpanzee, lion, or an anatomical heart. Silver only.',
  180, null, true);

drop function public.__veza_upsert_product(text,text,text,text,text,numeric,numeric,boolean);

-- ---------------------------------------------------------------------------
-- 3. Gemstone library — the 12 muses of 2026
-- ---------------------------------------------------------------------------
do $$
declare
  gems record;
begin
  for gems in
    select * from (values
      ('garnet',           'Garnet',           'Deeply saturated crimson red — the fire of the Great Dyke.'),
      ('pink-tourmaline',  'Pink Tourmaline',  'Romantic brilliant pink — a stone that catches candlelight.'),
      ('morganite',        'Morganite',        'Delicate champagne pink softening into peach.'),
      ('citrine',          'Citrine',          'Warm deep honey-toned golden quartz.'),
      ('pale-citrine',     'Pale Citrine',     'Luminous pale yellow — a sunshine-bright quartz.'),
      ('clear-quartz',     'Clear Quartz',     'Brilliant, transparent, endlessly versatile.'),
      ('tsavorite',        'Tsavorite',        'Vivid, intense emerald green — rare and unmistakable.'),
      ('mtoralite',        'Mtoralite',        'An opaque jade-green Zimbabwean treasure, found nowhere else on Earth.'),
      ('aquamarine',       'Aquamarine',       'Serene pale blue, mirroring tranquil waters.'),
      ('amethyst',         'Amethyst',         'Rich regal violet quartz.'),
      ('smokey-quartz',    'Smokey Quartz',    'Translucent, earth-toned with misty depths.'),
      ('black-tourmaline', 'Black Tourmaline', 'Powerful, opaque jet black — architectural in feel.')
    ) as t(slug, name, symbolism)
  loop
    insert into public.gemstones (slug, name, symbolism, origin, description, published)
    values (gems.slug, gems.name, gems.symbolism, 'Zimbabwe', gems.symbolism, true)
    on conflict (slug) do update set
      name = excluded.name,
      symbolism = excluded.symbolism,
      published = true;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Media gallery (admin-managed image library)
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text,           -- null for public/images/** seeded rows
  url text not null,
  content_hash text unique,    -- SHA-256; enforces dedupe
  alt text,
  width int,
  height int,
  byte_size int,
  mime text,
  source text not null default 'upload', -- 'upload' | 'seed'
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);
grant select on public.gallery_images to anon, authenticated;
grant insert, update, delete on public.gallery_images to authenticated;
grant all on public.gallery_images to service_role;
alter table public.gallery_images enable row level security;

drop policy if exists "gallery public read" on public.gallery_images;
create policy "gallery public read"
  on public.gallery_images for select to anon, authenticated using (true);

drop policy if exists "gallery admin write" on public.gallery_images;
create policy "gallery admin write"
  on public.gallery_images for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Storage bucket must be created via the Supabase dashboard (name: 'gallery', public read).
-- Storage policies (only admins may write):
do $$ begin
  drop policy if exists "gallery bucket admin write" on storage.objects;
  create policy "gallery bucket admin write" on storage.objects for all to authenticated
    using (bucket_id = 'gallery' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
    with check (bucket_id = 'gallery' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
  drop policy if exists "gallery bucket public read" on storage.objects;
  create policy "gallery bucket public read" on storage.objects for select to anon, authenticated
    using (bucket_id = 'gallery');
exception when others then null; end $$;

-- Seed rows for public/images/** so the gallery has content immediately.
insert into public.gallery_images (url, source, alt) values
  ('/images/brand/veza-logo-gold-on-teal.jpg', 'seed', 'VEZA gold logo on teal'),
  ('/images/journal/authenticity.jpg',        'seed', 'Authenticity — journal'),
  ('/images/journal/engagement.jpg',          'seed', 'Engagement — journal'),
  ('/images/journal/patience.jpg',            'seed', 'Patience — journal'),
  ('/images/journal/tradition-design.jpg',    'seed', 'Tradition & design — journal'),
  ('/images/journal/zimbabwe-stones.jpg',     'seed', 'Zimbabwe stones — journal')
on conflict (content_hash) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Shipping — zones × couriers × rates (admin-editable, seeded as placeholders)
-- ---------------------------------------------------------------------------
create table if not exists public.shipping_couriers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  enabled boolean not null default true,
  sort_order int not null default 0
);
create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  country_codes text[] not null default '{}'::text[],
  sort_order int not null default 0
);
create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  courier_id uuid references public.shipping_couriers(id) on delete cascade,
  zone_id uuid references public.shipping_zones(id) on delete cascade,
  base_usd numeric(10,2) not null default 0,        -- flat base fee
  per_kg_usd numeric(10,2) not null default 0,      -- variable per kg
  eta_days text,                                    -- '2-4 days'
  confirmed boolean not null default false,         -- flip when live rate confirmed with courier
  updated_at timestamptz not null default now(),
  unique (courier_id, zone_id)
);

grant select on public.shipping_couriers, public.shipping_zones, public.shipping_rates to anon, authenticated;
grant insert, update, delete on public.shipping_couriers, public.shipping_zones, public.shipping_rates to authenticated;
grant all on public.shipping_couriers, public.shipping_zones, public.shipping_rates to service_role;
alter table public.shipping_couriers enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.shipping_rates enable row level security;

drop policy if exists "shipping public read" on public.shipping_couriers;
create policy "shipping public read" on public.shipping_couriers for select to anon, authenticated using (enabled);
drop policy if exists "shipping admin write" on public.shipping_couriers;
create policy "shipping admin write" on public.shipping_couriers for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "shipping zones public read" on public.shipping_zones;
create policy "shipping zones public read" on public.shipping_zones for select to anon, authenticated using (true);
drop policy if exists "shipping zones admin write" on public.shipping_zones;
create policy "shipping zones admin write" on public.shipping_zones for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "shipping rates public read" on public.shipping_rates;
create policy "shipping rates public read" on public.shipping_rates for select to anon, authenticated using (true);
drop policy if exists "shipping rates admin write" on public.shipping_rates;
create policy "shipping rates admin write" on public.shipping_rates for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

insert into public.shipping_couriers (code, name, sort_order) values
  ('dhl',     'DHL Express',   10),
  ('fedex',   'FedEx',         20),
  ('ups',     'UPS',           30),
  ('aramex',  'Aramex',        40),
  ('zimpost', 'EMS / Zimpost', 50)
on conflict (code) do nothing;

insert into public.shipping_zones (code, name, country_codes, sort_order) values
  ('zw',    'Zimbabwe (domestic)', array['ZW'], 5),
  ('af',    'Rest of Africa',      array['ZA','BW','NA','ZM','MZ','MW','TZ','KE','UG','RW','GH','NG','EG','MA'], 10),
  ('eu',    'Europe (EU)',         array['DE','FR','IT','ES','NL','BE','SE','DK','FI','IE','PT','AT','PL','CZ','GR','HU','RO'], 20),
  ('uk',    'United Kingdom',      array['GB'], 30),
  ('na',    'North America',       array['US','CA','MX'], 40),
  ('me',    'Middle East',         array['AE','SA','QA','KW','BH','OM','IL','JO','LB','TR'], 50),
  ('asia',  'Asia',                array['CN','JP','KR','SG','HK','TW','IN','TH','MY','ID','PH','VN'], 60),
  ('oc',    'Oceania',             array['AU','NZ'], 70),
  ('row',   'Rest of World',       array['*'], 99)
on conflict (code) do nothing;

-- Placeholder rates — flagged confirmed = false so UI can render "estimated".
do $$
declare c record; z record;
        base_map jsonb := '{
          "dhl":     {"zw": 15, "af": 60, "eu": 95, "uk": 95, "na": 110, "me": 90, "asia": 105, "oc": 130, "row": 130},
          "fedex":   {"zw": 15, "af": 55, "eu": 90, "uk": 92, "na": 105, "me": 88, "asia": 100, "oc": 125, "row": 125},
          "ups":     {"zw": 18, "af": 65, "eu": 100,"uk": 100,"na": 115, "me": 95, "asia": 110, "oc": 135, "row": 135},
          "aramex":  {"zw": 12, "af": 45, "eu": 80, "uk": 80, "na": 95,  "me": 65, "asia": 90,  "oc": 115, "row": 115},
          "zimpost": {"zw": 8,  "af": 30, "eu": 55, "uk": 55, "na": 70,  "me": 50, "asia": 70,  "oc": 90,  "row": 90}
        }'::jsonb;
        pk_map jsonb := '{"dhl":25,"fedex":22,"ups":24,"aramex":18,"zimpost":12}'::jsonb;
begin
  for c in select * from public.shipping_couriers loop
    for z in select * from public.shipping_zones loop
      insert into public.shipping_rates (courier_id, zone_id, base_usd, per_kg_usd, eta_days, confirmed)
      values (
        c.id, z.id,
        coalesce((base_map -> c.code ->> z.code)::numeric, 100),
        coalesce((pk_map -> c.code)::numeric, 20),
        case z.code when 'zw' then '1-2 days' when 'af' then '3-6 days' when 'row' then '7-14 days' else '4-8 days' end,
        false
      )
      on conflict (courier_id, zone_id) do nothing;
    end loop;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Orders — extensions for buyer portal + abandoned cart tracking
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists is_abandoned boolean not null default false,
  add column if not exists courier_id uuid references public.shipping_couriers(id),
  add column if not exists tracking_number text,
  add column if not exists status_history jsonb not null default '[]'::jsonb,
  add column if not exists shipping_country text,
  add column if not exists shipping_weight_kg numeric(6,2),
  add column if not exists contact_email text,
  add column if not exists contact_name text,
  add column if not exists contact_phone text;

-- Allow anonymous / abandoned orders (contact-only, no user_id)
do $$ begin
  alter table public.orders alter column user_id drop not null;
exception when others then null; end $$;

drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders for select to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "orders own insert" on public.orders;
create policy "orders own insert" on public.orders for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "orders admin write" on public.orders;
create policy "orders admin write" on public.orders for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------------------------------------------------------------------------
-- 7. Analytics — lightweight event log
-- ---------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id bigserial primary key,
  event text not null,           -- 'page_view'|'product_view'|'add_to_cart'|'checkout_start'|'order_created'
  path text,
  referrer text,
  session_id text,
  user_id uuid,
  product_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_event_created_idx
  on public.analytics_events (event, created_at desc);
create index if not exists analytics_events_path_idx
  on public.analytics_events (path);

grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;
alter table public.analytics_events enable row level security;

drop policy if exists "analytics anon insert" on public.analytics_events;
create policy "analytics anon insert" on public.analytics_events for insert to anon, authenticated
  with check (true);

drop policy if exists "analytics admin read" on public.analytics_events;
create policy "analytics admin read" on public.analytics_events for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------------------------------------------------------------------------
-- 8. Re-confirm founder admin account (idempotent — matches prior migration)
-- ---------------------------------------------------------------------------
do $$
declare v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'khanyisile@veza-studios.com';

  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      v_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'khanyisile@veza-studios.com',
      crypt('VezaAtelier#2026', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Khanyisile Chiganze"}'::jsonb,
      now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_uid, v_uid::text,
      jsonb_build_object('sub', v_uid::text, 'email', 'khanyisile@veza-studios.com', 'email_verified', true),
      'email', now(), now(), now()
    );
  end if;

  insert into public.profiles (id, full_name, email, is_admin, must_change_password)
  values (v_uid, 'Khanyisile Chiganze', 'khanyisile@veza-studios.com', true, true)
  on conflict (id) do update set
    full_name = 'Khanyisile Chiganze',
    is_admin = true;
end $$;
