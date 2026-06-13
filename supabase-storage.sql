-- Profil fotograflari icin Supabase Storage kovasi (bucket) + izinleri.
-- Supabase > SQL Editor'da BIR KEZ calistir.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_read" on storage.objects;
drop policy if exists "avatars_insert" on storage.objects;
drop policy if exists "avatars_update" on storage.objects;

create policy "avatars_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars_update"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');
