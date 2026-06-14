-- OKEY101 — Güvenlik sorusu ile şifre sıfırlama (e-postasız)
-- Bu dosyayı Supabase > SQL Editor'da BİR KEZ çalıştır.

-- 1) Şifre hash'leri için pgcrypto
create extension if not exists pgcrypto with schema extensions;

-- 2) profiles tablosuna güvenlik sorusu + (hash'li) cevap kolonları
alter table profiles add column if not exists guvenlik_soru text;
alter table profiles add column if not exists guvenlik_cevap text;

-- 3) Giriş yapmış kullanıcı kendi güvenlik sorusunu/cevabını kaydeder
create or replace function guvenlik_kaydet(p_soru text, p_cevap text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update profiles
  set guvenlik_soru = p_soru,
      guvenlik_cevap = crypt(lower(trim(p_cevap)), gen_salt('bf'))
  where id = auth.uid();
end;
$$;

-- 4) Kullanıcı adından güvenlik sorusunu getir (giriş yapmadan)
create or replace function guvenlik_soru_getir(p_kullanici_adi text)
returns text
language sql
security definer
set search_path = public
as $$
  select guvenlik_soru from profiles
  where lower(kullanici_adi) = lower(p_kullanici_adi)
  limit 1;
$$;

-- 5) Cevabı doğrula ve şifreyi sıfırla
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
  from profiles
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

-- 6) Yetkiler
grant execute on function guvenlik_kaydet(text, text) to authenticated;
grant execute on function guvenlik_soru_getir(text) to anon, authenticated;
grant execute on function sifre_sifirla(text, text, text) to anon, authenticated;
