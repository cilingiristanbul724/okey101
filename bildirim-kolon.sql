-- masa_oyunculari tablosuna katilim zamani icin created_at kolonu ekler.
-- Bildirimler sayfasinda "kac dakika once katildi / eslesti" bilgisini
-- dogru gostermek icin gereklidir. Supabase > SQL Editor'de bir kez calistir.
alter table masa_oyunculari
  add column if not exists created_at timestamptz default now();
