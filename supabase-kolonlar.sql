alter table public.masalar add column if not exists acan_id uuid;
alter table public.masalar add column if not exists aranan_kisi int;
alter table public.masalar add column if not exists mevcut_kisi int;
alter table public.masalar add column if not exists mekan_adi text;
alter table public.masalar add column if not exists adres text;
alter table public.masalar add column if not exists enlem double precision;
alter table public.masalar add column if not exists boylam double precision;
alter table public.masalar add column if not exists sure_dk int;
alter table public.masalar add column if not exists bitis_zamani timestamptz;
alter table public.masalar add column if not exists notu text;
alter table public.masalar add column if not exists durum text default 'Acik';
alter table public.masalar add column if not exists created_at timestamptz default now();

alter table public.masa_oyunculari add column if not exists masa_id uuid;
alter table public.masa_oyunculari add column if not exists oyuncu_id uuid;
alter table public.masa_oyunculari add column if not exists katilim_durumu text default 'Talep';
alter table public.masa_oyunculari add column if not exists created_at timestamptz default now();

alter table public.mesajlar add column if not exists masa_id uuid;
alter table public.mesajlar add column if not exists gonderen_id uuid;
alter table public.mesajlar add column if not exists icerik text;
alter table public.mesajlar add column if not exists created_at timestamptz default now();

alter table public.arkadaslar add column if not exists isteyen_id uuid;
alter table public.arkadaslar add column if not exists istenen_id uuid;
alter table public.arkadaslar add column if not exists durum text default 'Beklemede';
alter table public.arkadaslar add column if not exists created_at timestamptz default now();

alter table public.ozel_mesajlar add column if not exists gonderen_id uuid;
alter table public.ozel_mesajlar add column if not exists alici_id uuid;
alter table public.ozel_mesajlar add column if not exists icerik text;
alter table public.ozel_mesajlar add column if not exists created_at timestamptz default now();

notify pgrst, 'reload schema';
