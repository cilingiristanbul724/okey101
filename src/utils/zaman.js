// timestamptz veya tz'siz timestamp degerini guvenli sekilde UTC milisaniyeye cevirir.
// Postgres timestamptz degeri "+00:00" / "Z" iceren bir string doner; tz'siz timestamp icermez.
// tz bilgisi yoksa degeri UTC kabul ederiz (cunku DB'ye .toISOString() ile UTC yaziyoruz).
// Boylece UTC+3 gibi saat dilimlerinde masanin erken kapanmasi onlenir.
export function zamanMs(deger) {
  if (!deger) return 0
  if (deger instanceof Date) return deger.getTime()
  let s = String(deger).trim().replace(' ', 'T')
  if (!/([zZ]|[+-]\d{2}:?\d{2})$/.test(s)) s += 'Z'
  const t = new Date(s).getTime()
  return isNaN(t) ? 0 : t
}
