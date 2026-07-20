-- =============================================================================
-- VEZA — additional admin account for Washington
-- Run in the Supabase SQL Editor for project whyznavacdxizkrztdsi.
-- Safe to re-run.
--
-- Keeps waskap@me.com as a client account and forces both accounts through
-- the change-password screen on next login.
--
--   New admin:   washington@africaprocure.com
--   Temp pass:   VezaAdmin#2026    (must change on first login)
--   Client:      waskap@me.com
--   Temp pass:   VezaClient#2026   (must change on first login)
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Create / refresh washington@africaprocure.com as an admin
-- ---------------------------------------------------------------------------
do $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'washington@africaprocure.com';

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
      'washington@africaprocure.com',
      crypt('VezaAdmin#2026', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Washington"}'::jsonb,
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
        'email', 'washington@africaprocure.com',
        'email_verified', true
      ),
      'email',
      now(), now(), now()
    );
  else
    -- Reset password to the temp one so first-login flow is deterministic
    update auth.users
       set encrypted_password = crypt('VezaAdmin#2026', gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = v_uid;
  end if;

  insert into public.profiles (id, full_name, email, is_admin, must_change_password)
  values (v_uid, 'Washington', 'washington@africaprocure.com', true, true)
  on conflict (id) do update
    set full_name = coalesce(public.profiles.full_name, 'Washington'),
        email = 'washington@africaprocure.com',
        is_admin = true,
        must_change_password = true;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Keep waskap@me.com as a client and reset the password
-- ---------------------------------------------------------------------------
do $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'waskap@me.com';

  if v_uid is not null then
    update auth.users
       set encrypted_password = crypt('VezaClient#2026', gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = v_uid;

    insert into public.profiles (id, full_name, email, is_admin, must_change_password)
    values (v_uid, 'Washington Kapapiro', 'waskap@me.com', false, true)
    on conflict (id) do update
      set email = 'waskap@me.com',
          is_admin = false,
          must_change_password = true;
  end if;
end $$;
