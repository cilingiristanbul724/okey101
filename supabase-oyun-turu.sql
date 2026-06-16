-- 101 RakipBul - Masa filtreleri icin oyun turu kolonu
-- Supabase -> SQL Editor'de calistir. Tekrar calistirmak guvenli (if not exists).
alter table public.masalar add column if not exists oyun_turu text;
