-- =============================================================================
-- VEZA — founder admin account, collection scheduling, payment settings
-- Run this migration in the Supabase SQL Editor for the project.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT / drop-then-create policies.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Collections: status + launch scheduling + teaser
-- ---------------------------------------------------------------------------
alter table public.collections
  add column if not exists status text not null default 'live',
  add column if not exists launch_at timestamptz,
  add column if not exists teaser text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'collections_status_check'
  ) then
    alter table public.collections
      add constraint collections_status_check
      check (status in ('draft','coming_soon','live'));
  end if;
end $$;

drop policy if exists "collections public read" on public.collections;
drop policy if exists "Collections are viewable by everyone" on public.collections;
create policy "collections public read"
  on public.collections for select to anon, authenticated
  using (
    status in ('coming_soon','live')
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin
    )
  );

drop policy if exists "products public read" on public.products;
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "products public read"
  on public.products for select to anon, authenticated
  using (
    published
    and (
      collection_id is null
      or exists (
        select 1 from public.collections c
        where c.id = products.collection_id
          and (
            c.status = 'live'
            or (c.status = 'coming_soon' and c.launch_at is not null and c.launch_at <= now())
          )
      )
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.is_admin
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 2. Profiles: must_change_password flag
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists must_change_password boolean not null default false;

-- ---------------------------------------------------------------------------
-- 3. Payment settings (singleton row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.payment_settings (
  id smallint primary key default 1,
  payments_enabled boolean not null default false,
  stripe_publishable_key text,
  currency text not null default 'USD',
  updated_at timestamptz not null default now(),
  constraint payment_settings_singleton check (id = 1)
);

grant select on public.payment_settings to anon, authenticated;
grant all on public.payment_settings to service_role;
alter table public.payment_settings enable row level security;

drop policy if exists "payment settings public read" on public.payment_settings;
create policy "payment settings public read"
  on public.payment_settings for select to anon, authenticated using (true);

drop policy if exists "payment settings admin write" on public.payment_settings;
create policy "payment settings admin write"
  on public.payment_settings for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

insert into public.payment_settings (id, payments_enabled)
values (1, false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Seed two collections (coming_soon, no launch dates, no products)
-- ---------------------------------------------------------------------------
insert into public.collections (name, slug, description, story, sort_order, published, status, teaser)
values
  ('Everyday & Corporate',
   'everyday',
   'A refined wardrobe of pieces made to be worn — day into evening, quietly.',
   null,
   10, true, 'coming_soon',
   'The daily wardrobe. Photography arriving next week.'),
  ('Fashion Week',
   'fashion-week',
   'A bolder, more artistic study in form — released in season with the runway.',
   null,
   20, true, 'coming_soon',
   'A runway-season release. Launch dates announced soon.')
on conflict (slug) do update
  set status = excluded.status,
      teaser = coalesce(public.collections.teaser, excluded.teaser);

-- ---------------------------------------------------------------------------
-- 5. Founder admin account — Khanyisile Chiganze
--    Email: khanyisile@veza-studios.com
--    Temp password: VezaAtelier#2026  (flagged must_change_password = true)
-- ---------------------------------------------------------------------------
do $$
declare
  v_uid uuid;
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
      'authenticated',
      'authenticated',
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
      gen_random_uuid(),
      v_uid,
      v_uid::text,
      jsonb_build_object(
        'sub', v_uid::text,
        'email', 'khanyisile@veza-studios.com',
        'email_verified', true
      ),
      'email',
      now(), now(), now()
    );
  end if;

  insert into public.profiles (id, full_name, email, is_admin, must_change_password)
  values (v_uid, 'Khanyisile Chiganze', 'khanyisile@veza-studios.com', true, true)
  on conflict (id) do update
    set full_name = 'Khanyisile Chiganze',
        email = 'khanyisile@veza-studios.com',
        is_admin = true,
        must_change_password = true;
end $$;
