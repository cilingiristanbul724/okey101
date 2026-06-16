alter table masa_oyunculari enable row level security;

drop policy if exists "davet_masa_sahibi_ekle" on masa_oyunculari;
create policy "davet_masa_sahibi_ekle" on masa_oyunculari
  for insert to authenticated
  with check (
    exists (select 1 from masalar m where m.id = masa_id and m.acan_id = auth.uid())
  );

drop policy if exists "davet_oyuncu_guncelle" on masa_oyunculari;
create policy "davet_oyuncu_guncelle" on masa_oyunculari
  for update to authenticated
  using (oyuncu_id = auth.uid())
  with check (oyuncu_id = auth.uid());

drop policy if exists "davet_okuma" on masa_oyunculari;
create policy "davet_okuma" on masa_oyunculari
  for select to authenticated
  using (
    oyuncu_id = auth.uid()
    or exists (select 1 from masalar m where m.id = masa_id and m.acan_id = auth.uid())
  );

-- katilim_durumu'na 'Davet' degerini izinli hale getir
alter table masa_oyunculari drop constraint if exists masa_oyunculari_katilim_durumu_check;
alter table masa_oyunculari add constraint masa_oyunculari_katilim_durumu_check
  check (katilim_durumu in ('Talep','Onayli','Red','Davet'));
