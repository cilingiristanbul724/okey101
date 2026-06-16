-- 101 RakipBul - Temizlik / bakim SQL
-- Masalarin "kendi kendine dolup tasma" sorununa yol acan eski trigger'i kaldirir.
-- Supabase -> SQL Editor'de calistir.
drop trigger if exists trg_masa_doldu on public.masa_oyunculari;
