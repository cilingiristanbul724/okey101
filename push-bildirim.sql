-- ============================================================
-- WEB PUSH BİLDİRİMİ - veritabanı kurulumu (idempotent)
-- Supabase > SQL Editor'de çalıştır.
-- ============================================================

create table if not exists push_abonelikleri (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  abonelik jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_push_kullanici on push_abonelikleri(kullanici_id);

alter table push_abonelikleri enable row level security;

drop policy if exists "push_sec" on push_abonelikleri;
create policy "push_sec" on push_abonelikleri
  for select using (auth.uid() = kullanici_id);

drop policy if exists "push_ekle" on push_abonelikleri;
create policy "push_ekle" on push_abonelikleri
  for insert with check (auth.uid() = kullanici_id);

drop policy if exists "push_guncelle" on push_abonelikleri;
create policy "push_guncelle" on push_abonelikleri
  for update using (auth.uid() = kullanici_id) with check (auth.uid() = kullanici_id);

drop policy if exists "push_sil" on push_abonelikleri;
create policy "push_sil" on push_abonelikleri
  for delete using (auth.uid() = kullanici_id);
