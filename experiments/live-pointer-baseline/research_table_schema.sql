-- Reference for the additive server migration amelia_research_records_v1.
-- This table is separate from public.amelia_memory_records and starts empty.
create table public.amelia_research_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  store text not null check (store in ('runtime','dialogue','processMemory','canalizationRuns','paper6Assays','snapshots')),
  record_id text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, store, record_id)
);
create index amelia_research_records_user_updated_idx on public.amelia_research_records (user_id, updated_at);
alter table public.amelia_research_records enable row level security;
revoke all on public.amelia_research_records from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.amelia_research_records to authenticated, service_role;
create policy "Owners read Amelia research memory" on public.amelia_research_records
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners insert Amelia research memory" on public.amelia_research_records
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners update Amelia research memory" on public.amelia_research_records
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Owners delete Amelia research memory" on public.amelia_research_records
  for delete to authenticated using ((select auth.uid()) = user_id);
comment on table public.amelia_research_records is 'Isolated Amelia research copy; account-owned and separate from the main application memory.';
