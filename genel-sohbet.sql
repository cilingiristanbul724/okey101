-- Halka acik genel sohbet kanali
create table if not exists public.genel_mesajlar (
  id uuid primary key default gen_random_uuid(),
  gonderen_id uuid references public.profiles(id) on delete cascade,
  icerik text not null,
  created_at timestamptz default now()
);

alter table public.genel_mesajlar enable row level security;

drop policy if exists "genel_select" on public.genel_mesajlar;
create policy "genel_select" on public.genel_mesajlar for select using (true);

drop policy if exists "genel_insert" on public.genel_mesajlar;
create policy "genel_insert" on public.genel_mesajlar for insert with check (auth.uid() = gonderen_id);

-- Realtime yayinina ekle (zaten ekliyse atla)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'genel_mesajlar'
  ) then
    alter publication supabase_realtime add table public.genel_mesajlar;
  end if;
end $$;

notify pgrst, 'reload schema';
