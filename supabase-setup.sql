create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  kullanici_adi text unique,
  ad_soyad text,
  cinsiyet text,
  foto_url text,
  created_at timestamptz default now()
);

alter table public.profiles add column if not exists kullanici_adi text;
alter table public.profiles add column if not exists ad_soyad text;
alter table public.profiles add column if not exists cinsiyet text;
alter table public.profiles add column if not exists foto_url text;
alter table public.profiles add column if not exists guvenlik_soru text;
alter table public.profiles add column if not exists guvenlik_cevap text;

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

alter table public.profiles enable row level security;
alter table public.masalar enable row level security;
alter table public.masa_oyunculari enable row level security;
alter table public.mesajlar enable row level security;
alter table public.arkadaslar enable row level security;
alter table public.ozel_mesajlar enable row level security;

drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "masalar_select" on public.masalar;
drop policy if exists "masalar_insert" on public.masalar;
drop policy if exists "masalar_update" on public.masalar;
create policy "masalar_select" on public.masalar for select using (true);
create policy "masalar_insert" on public.masalar for insert with check (auth.uid() = acan_id);
create policy "masalar_update" on public.masalar for update using (auth.uid() = acan_id);

drop policy if exists "mo_select" on public.masa_oyunculari;
drop policy if exists "mo_insert" on public.masa_oyunculari;
drop policy if exists "mo_delete" on public.masa_oyunculari;
drop policy if exists "mo_update" on public.masa_oyunculari;
create policy "mo_select" on public.masa_oyunculari for select using (true);
create policy "mo_insert" on public.masa_oyunculari for insert with check (auth.uid() = oyuncu_id);
create policy "mo_delete" on public.masa_oyunculari for delete using (auth.uid() = oyuncu_id);
create policy "mo_update" on public.masa_oyunculari for update using (true);

drop policy if exists "mesaj_select" on public.mesajlar;
drop policy if exists "mesaj_insert" on public.mesajlar;
create policy "mesaj_select" on public.mesajlar for select using (true);
create policy "mesaj_insert" on public.mesajlar for insert with check (auth.uid() = gonderen_id);

drop policy if exists "ark_select" on public.arkadaslar;
drop policy if exists "ark_insert" on public.arkadaslar;
drop policy if exists "ark_update" on public.arkadaslar;
create policy "ark_select" on public.arkadaslar for select using (true);
create policy "ark_insert" on public.arkadaslar for insert with check (auth.uid() = isteyen_id);
create policy "ark_update" on public.arkadaslar for update using (auth.uid() = istenen_id or auth.uid() = isteyen_id);

drop policy if exists "ozel_select" on public.ozel_mesajlar;
drop policy if exists "ozel_insert" on public.ozel_mesajlar;
create policy "ozel_select" on public.ozel_mesajlar for select using (auth.uid() = gonderen_id or auth.uid() = alici_id);
create policy "ozel_insert" on public.ozel_mesajlar for insert with check (auth.uid() = gonderen_id);

do $$
begin
  begin
    alter publication supabase_realtime add table public.mesajlar;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.ozel_mesajlar;
  exception when duplicate_object then null;
  end;
end $$;

create extension if not exists pgcrypto with schema extensions;

create or replace function guvenlik_kaydet(p_soru text, p_cevap text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.profiles
  set guvenlik_soru = p_soru,
      guvenlik_cevap = crypt(lower(trim(p_cevap)), gen_salt('bf'))
  where id = auth.uid();
end;
$$;

create or replace function guvenlik_soru_getir(p_kullanici_adi text)
returns text
language sql
security definer
set search_path = public
as $$
  select guvenlik_soru from public.profiles
  where lower(kullanici_adi) = lower(p_kullanici_adi)
  limit 1;
$$;

create or replace function sifre_sifirla(p_kullanici_adi text, p_cevap text, p_yeni_sifre text)
returns text
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_id uuid;
  v_hash text;
begin
  select id, guvenlik_cevap into v_id, v_hash
  from public.profiles
  where lower(kullanici_adi) = lower(p_kullanici_adi)
  limit 1;

  if v_id is null then return 'KULLANICI_YOK'; end if;
  if v_hash is null then return 'SORU_YOK'; end if;
  if crypt(lower(trim(p_cevap)), v_hash) <> v_hash then return 'CEVAP_YANLIS'; end if;
  if length(p_yeni_sifre) < 6 then return 'SIFRE_KISA'; end if;

  update auth.users
  set encrypted_password = crypt(p_yeni_sifre, gen_salt('bf'))
  where id = v_id;

  return 'TAMAM';
end;
$$;

grant execute on function guvenlik_kaydet(text, text) to authenticated;
grant execute on function guvenlik_soru_getir(text) to anon, authenticated;
grant execute on function sifre_sifirla(text, text, text) to anon, authenticated;
