-- Audit log for staff / admin actions
-- Run in the production project (whyznavacdxizkrztdsi) SQL editor.

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  actor_email text,
  actor_role text not null check (actor_role in ('admin','staff')),
  action text not null,           -- e.g. 'journal.create', 'gallery.upload', 'order.status'
  entity text,                    -- e.g. 'journal_posts', 'gallery_images', 'orders'
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

grant select, insert on public.audit_log to authenticated;
grant all on public.audit_log to service_role;

alter table public.audit_log enable row level security;

-- Any staff or admin may write their own rows (actor_id must be self)
drop policy if exists "audit_log insert self" on public.audit_log;
create policy "audit_log insert self"
  on public.audit_log
  for insert
  to authenticated
  with check (
    actor_id = auth.uid()
    and (
      exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_admin = true or p.is_staff = true))
    )
  );

-- Only admins may read
drop policy if exists "audit_log admin read" on public.audit_log;
create policy "audit_log admin read"
  on public.audit_log
  for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_actor_idx on public.audit_log (actor_id);
