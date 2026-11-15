-- MANUAL SETUP FOR A SEPARATE PROTOTYPE PROJECT ONLY.
-- This file has not been applied to Amelia's Supabase or any remote database.
create table public.cg_reactor_checkpoints (
  owner uuid not null default auth.uid(),
  run_id text not null,
  revision integer not null check (revision > 0),
  payload jsonb not null,
  primary key (owner, run_id)
);
alter table public.cg_reactor_checkpoints enable row level security;
revoke all on public.cg_reactor_checkpoints from public, anon;
grant select, insert, update on public.cg_reactor_checkpoints to authenticated;
create policy cg_reactor_read on public.cg_reactor_checkpoints for select to authenticated
  using ((select auth.uid()) = owner);
create policy cg_reactor_insert on public.cg_reactor_checkpoints for insert to authenticated
  with check ((select auth.uid()) = owner);
create policy cg_reactor_update on public.cg_reactor_checkpoints for update to authenticated
  using ((select auth.uid()) = owner) with check ((select auth.uid()) = owner);
