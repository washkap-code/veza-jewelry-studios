-- =============================================================================
-- VEZA — Staff role (limited-access team members)
-- Run in the Supabase SQL Editor for project whyznavacdxizkrztdsi.
-- Safe to re-run.
--
-- Adds an `is_staff` flag to profiles. Staff members can help with:
--   • Journal posts (create / edit)
--   • Gallery images (upload / manage)
--   • Orders (update status, view details)
-- They CANNOT touch products, collections, gemstones, commissions,
-- newsletter, calendar, or settings — those remain admin-only.
-- =============================================================================

-- 1. Column ------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_staff boolean not null default false;

-- 2. Non-recursive helper ----------------------------------------------------
create or replace function public.is_staff_or_admin(_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = _uid and (is_admin = true or is_staff = true)
  )
$$;

grant execute on function public.is_staff_or_admin(uuid) to authenticated;

-- 3. Extend RLS on the three staff-accessible tables -------------------------
-- journal_posts: staff may manage
drop policy if exists "Staff or admin manage journal_posts" on public.journal_posts;
create policy "Staff or admin manage journal_posts"
  on public.journal_posts
  for all
  to authenticated
  using (public.is_staff_or_admin(auth.uid()))
  with check (public.is_staff_or_admin(auth.uid()));

-- gallery_images: staff may manage
drop policy if exists "Staff or admin manage gallery_images" on public.gallery_images;
create policy "Staff or admin manage gallery_images"
  on public.gallery_images
  for all
  to authenticated
  using (public.is_staff_or_admin(auth.uid()))
  with check (public.is_staff_or_admin(auth.uid()));

-- orders: staff may view all + update status (not delete)
drop policy if exists "Staff or admin read orders" on public.orders;
create policy "Staff or admin read orders"
  on public.orders
  for select
  to authenticated
  using (public.is_staff_or_admin(auth.uid()));

drop policy if exists "Staff or admin update orders" on public.orders;
create policy "Staff or admin update orders"
  on public.orders
  for update
  to authenticated
  using (public.is_staff_or_admin(auth.uid()))
  with check (public.is_staff_or_admin(auth.uid()));

-- order_items: staff may read (needed to show order lines)
drop policy if exists "Staff or admin read order_items" on public.order_items;
create policy "Staff or admin read order_items"
  on public.order_items
  for select
  to authenticated
  using (public.is_staff_or_admin(auth.uid()));

-- 4. Profiles: admins can toggle is_staff for anyone -------------------------
-- (Assumes an existing admin-update policy on profiles. If not present, this
--  adds it. Safe alongside existing "users can update own profile" policies.)
drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile"
  on public.profiles
  for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
