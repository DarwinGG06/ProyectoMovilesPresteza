-- Avisos en app para cliente, admin y repartidor.
create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  user_id text not null,
  role text,
  kind text not null,
  title text not null,
  body text not null,
  href text,
  ref_type text,
  ref_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_id_unread_idx
  on public.notifications (user_id)
  where read_at is null;

-- Push token Expo por usuario (APK / dispositivo).
alter table public.users
  add column if not exists expo_push_token text;

create index if not exists users_expo_push_token_idx
  on public.users (expo_push_token)
  where expo_push_token is not null;
