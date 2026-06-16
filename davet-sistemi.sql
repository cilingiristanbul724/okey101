-- ============================================================
-- MASA DAVET SISTEMI - RLS politikalari
-- Supabase > SQL Editor icinde calistir.
-- Amac: masa sahibi kendi masasina oyuncu DAVET edebilsin
--       (katilim_durumu = 'Davet'), davet edilen oyuncu da
--       kendi kaydini KABUL/RET edebilsin (Onayli / Red).
-- ============================================================

alter table masa_oyunculari enable row level security;

-- 1) Masa sahibi kendi masasina oyuncu kaydi ekleyebilsin (davet)
drop policy if exists "davet_masa_sahibi_ekle" on masa_oyunculari;
create policy "davet_masa_sahibi_ekle" on masa_oyunculari
  for insert to authenticated
  with check (
    exists (select 1 from masalar m where m.id = masa_id and m.acan_id = auth.uid())
  );

-- 2) Davet edilen oyuncu kendi kaydini guncelleyebilsin (kabul/ret)
drop policy if exists "davet_oyuncu_guncelle" on masa_oyunculari;
create policy "davet_oyuncu_guncelle" on masa_oyunculari
  for update to authenticated
  using (oyuncu_id = auth.uid())
  with check (oyuncu_id = auth.uid());

-- 3) Oyuncu kendi kayitlarini, masa sahibi de masasinin kayitlarini gorebilsin
drop policy if exists "davet_okuma" on masa_oyunculari;
create policy "davet_okuma" on masa_oyunculari
  for select to authenticated
  using (
    oyuncu_id = auth.uid()
    or exists (select 1 from masalar m where m.id = masa_id and m.acan_id = auth.uid())
  );

-- ============================================================
-- NOT: Eger katilim_durumu sutununda bir CHECK kisiti varsa ve
-- 'Davet' degerini reddederse, asagidakini de calistir.
-- (Kisit yoksa bu adimi atla.)
-- ============================================================
-- alter table masa_oyunculari drop constraint if exists masa_oyunculari_katilim_durumu_check;
-- alter table masa_oyunculari add constraint masa_oyunculari_katilim_durumu_check
--   check (katilim_durumu in ('Talep','Onayli','Red','Davet'));
