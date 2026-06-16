// timestamptz veya tz'siz timestamp degerini guvenli sekilde UTC milisaniyeye cevirir.
// Postgres timestamptz degeri "+00:00" / "Z" iceren bir string doner; tz'siz timestamp icermez.
// tz bilgisi yoksa degeri UTC kabul ederiz (cunku DB'ye .toISOString() ile UTC yaziyoruz).
// Ayristirma basarisiz olursa ham degeri de deneriz; boylece masa hatali sekilde erken kapanmaz.
export function zamanMs(deger) {
  if (!deger) return 0
  if (deger instanceof Date) return deger.getTime()
  const ham = String(deger).trim()
  let s = ham.replace(' ', 'T')
  if (!/([zZ]|[+-]\d{2}:?\d{2})$/.test(s)) s += 'Z'
  let t = new Date(s).getTime()
  if (isNaN(t)) t = new Date(ham).getTime()
  return isNaN(t) ? 0 : t
}

// "2 dakika once", "5 saat once", "Dun", "3 gun once" gibi goreli zaman metni uretir.
export function gecenSure(deger) {
  const t = zamanMs(deger)
  if (!t) return ''
  let fark = Date.now() - t
  if (fark < 0) fark = 0
  const dk = Math.floor(fark / 60000)
  if (dk < 1) return 'az önce'
  if (dk < 60) return dk + ' dakika önce'
  const sa = Math.floor(dk / 60)
  if (sa < 24) return sa + ' saat önce'
  const gun = Math.floor(sa / 24)
  if (gun === 1) return 'Dün'
  if (gun < 7) return gun + ' gün önce'
  return new Date(t).toLocaleDateString('tr-TR')
}

// "15:00" gibi yerel saat bicimi dondurur.
export function saatBicim(deger) {
  const t = zamanMs(deger)
  if (!t) return ''
  return new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}
