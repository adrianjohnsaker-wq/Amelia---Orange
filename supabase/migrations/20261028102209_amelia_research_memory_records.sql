create table public.amelia_memory_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  store text not null check (store in ('runtime', 'dialogue', 'processMemory', 'canalizationRuns', 'paper6Assays', 'snapshots')),
  record_id text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, store, record_id)
);

create index amelia_memory_records_updated_idx
  on public.amelia_memory_records (user_id, updated_at desc);

alter table public.amelia_memory_records enable row level security;

create policy "Owners can read Amelia memory"
  on public.amelia_memory_records for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can insert Amelia memory"
  on public.amelia_memory_records for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can update Amelia memory"
  on public.amelia_memory_records for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Owners can delete Amelia memory"
  on public.amelia_memory_records for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.amelia_memory_records to authenticated;
revoke all on public.amelia_memory_records from anon, public;
