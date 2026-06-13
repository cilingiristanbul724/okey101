-- 101 Okey — Revize MVP veritabanı kurulumu
-- Supabase > SQL Editor'da BIR KEZ çalıştır.
-- Ayrıca: Authentication > Providers > Email > "Confirm email" seçeneğini KAPAT
-- (kullanıcı adı + şifre ile onaysız giriş için).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  kullanici_adi text unique,
  ad_soyad text,
  cinsiyet text,
  foto_url text,
  created_at timestamptz default now()
);

create table if not exists public.masalar (
  id uuid primary key default gen_random_uuid(),
  acan_id uuid references auth.users(id) on delete cascade,
  aranan_kisi int,
  mevcut_kisi int,
  mekan_adi text,
  adres text,
  enlem double precision,
  boylam double precision,
  sure_dk int,
  bitis_zamani timestamptz,
  notu text,
  durum text default 'Acik',
  created_at timestamptz default now()
);

create table if not exists public.masa_oyunculari (
  id uuid primary key default gen_random_uuid(),
  masa_id uuid references public.masalar(id) on delete cascade,
  oyuncu_id uuid references auth.users(id) on delete cascade,
  katilim_durumu text default 'Talep',
  created_at timestamptz default now()
);

create table if not exists public.mesajlar (
  id uuid primary key default gen_random_uuid(),
  masa_id uuid references public.masalar(id) on delete cascade,
  gonderen_id uuid references public.profiles(id) on delete cascade,
  icerik text,
  created_at timestamptz default now()
);

create table if not exists public.arkadaslar (
  id uuid primary key default gen_random_uuid(),
  isteyen_id uuid not null,
  istenen_id uuid not null,
  durum text default 'Beklemede',
  created_at timestamptz default now(),
  constraint arkadaslar_isteyen_id_fkey foreign key (isteyen_id) references public.profiles(id) on delete cascade,
  constraint arkadaslar_istenen_id_fkey foreign key (istenen_id) references public.profiles(id) on delete cascade,
  unique (isteyen_id, istenen_id)
);

create table if not exists public.ozel_mesajlar (
  id uuid primary key default gen_random_uuid(),
  gonderen_id uuid not null,
  alici_id uuid not null,
  icerik text,
  created_at timestamptz default now(),
  constraint ozel_mesajlar_gonderen_id_fkey foreign key (gonderen_id) references public.profiles(id) on delete cascade,
  constraint ozel_mesajlar_alici_id_fkey foreign key (alici_id) references public.profiles(id) on delete cascade
);

-- RLS (MVP: giriş yapan herkes okuyup yazabilir)
alter table public.profiles enable row level security;
alter table public.masalar enable row level security;
alter table public.masa_oyunculari enable row level security;
alter table public.mesajlar enable row level security;
alter table public.arkadaslar enable row level security;
alter table public.ozel_mesajlar enable row level security;

create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

create policy "masalar_select" on public.masalar for select using (true);
create policy "masalar_insert" on public.masalar for insert with check (auth.uid() = acan_id);
create policy "masalar_update" on public.masalar for update using (auth.uid() = acan_id);

create policy "mo_select" on public.masa_oyunculari for select using (true);
create policy "mo_insert" on public.masa_oyunculari for insert with check (auth.uid() = oyuncu_id);
create policy "mo_delete" on public.masa_oyunculari for delete using (auth.uid() = oyuncu_id);
create policy "mo_update" on public.masa_oyunculari for update using (true);

create policy "mesaj_select" on public.mesajlar for select using (true);
create policy "mesaj_insert" on public.mesajlar for insert with check (auth.uid() = gonderen_id);

create policy "ark_select" on public.arkadaslar for select using (true);
create policy "ark_insert" on public.arkadaslar for insert with check (auth.uid() = isteyen_id);
create policy "ark_update" on public.arkadaslar for update using (auth.uid() = istenen_id or auth.uid() = isteyen_id);

create policy "ozel_select" on public.ozel_mesajlar for select using (auth.uid() = gonderen_id or auth.uid() = alici_id);
create policy "ozel_insert" on public.ozel_mesajlar for insert with check (auth.uid() = gonderen_id);

-- Realtime (canlı sohbet) için tabloları yayına ekle
alter publication supabase_realtime add table public.mesajlar;
alter publication supabase_realtime add table public.ozel_mesajlar;
