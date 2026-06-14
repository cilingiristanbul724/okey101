-- ENGELLEME
create table if not exists public.engellemeler (
  id uuid primary key default gen_random_uuid(),
  engelleyen_id uuid references public.profiles(id) on delete cascade,
  engellenen_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (engelleyen_id, engellenen_id)
);
alter table public.engellemeler enable row level security;

drop policy if exists "engel_select" on public.engellemeler;
create policy "engel_select" on public.engellemeler for select using (
  auth.uid() = engelleyen_id or auth.uid() = engellenen_id
);
drop policy if exists "engel_insert" on public.engellemeler;
create policy "engel_insert" on public.engellemeler for insert with check (auth.uid() = engelleyen_id);
drop policy if exists "engel_delete" on public.engellemeler;
create policy "engel_delete" on public.engellemeler for delete using (auth.uid() = engelleyen_id);

-- SIKAYET
create table if not exists public.sikayetler (
  id uuid primary key default gen_random_uuid(),
  sikayet_eden_id uuid references public.profiles(id) on delete cascade,
  sikayet_edilen_id uuid references public.profiles(id) on delete cascade,
  sebep text,
  aciklama text,
  created_at timestamptz default now()
);
alter table public.sikayetler enable row level security;

drop policy if exists "sikayet_insert" on public.sikayetler;
create policy "sikayet_insert" on public.sikayetler for insert with check (auth.uid() = sikayet_eden_id);
drop policy if exists "sikayet_select" on public.sikayetler;
create policy "sikayet_select" on public.sikayetler for select using (auth.uid() = sikayet_eden_id);

-- KVKK / sozlesme onayi
alter table public.profiles add column if not exists kvkk_onay boolean default false;

notify pgrst, 'reload schema';
