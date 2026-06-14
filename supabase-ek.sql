-- 1) Masa basligi
alter table public.masalar add column if not exists baslik text;

-- 2) Cevrimici durumu icin son gorulme
alter table public.profiles add column if not exists son_gorulme timestamptz;

-- 3) Acik masalar, katilimcilar ve profiller herkese gorunsun
drop policy if exists "masalar_herkes_select" on public.masalar;
create policy "masalar_herkes_select" on public.masalar for select using (true);

drop policy if exists "masa_oyunculari_herkes_select" on public.masa_oyunculari;
create policy "masa_oyunculari_herkes_select" on public.masa_oyunculari for select using (true);

drop policy if exists "profiles_herkes_select" on public.profiles;
create policy "profiles_herkes_select" on public.profiles for select using (true);

-- 4) Sohbeti temizleme izni
drop policy if exists "mesajlar_silme" on public.mesajlar;
create policy "mesajlar_silme" on public.mesajlar for delete using (
  auth.uid() = gonderen_id
  or exists (select 1 from public.masalar m where m.id = mesajlar.masa_id and m.acan_id = auth.uid())
);

-- 5) Arkadaslik kaydini iki taraf da gorebilsin
--    (kabul eden taraf da arkadasligini gorebilsin ve mesaj atabilsin)
drop policy if exists "arkadaslar_taraflar_select" on public.arkadaslar;
create policy "arkadaslar_taraflar_select" on public.arkadaslar for select using (
  auth.uid() = isteyen_id or auth.uid() = istenen_id
);

notify pgrst, 'reload schema';
