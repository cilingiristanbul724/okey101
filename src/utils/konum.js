// İstanbul Anadolu Yakası için kabaca sınırlayıcı kutu (bounding box)
export const ANADOLU_BBOX = {
  minEnlem: 40.80,
  maxEnlem: 41.20,
  minBoylam: 29.00,
  maxBoylam: 29.45,
}

export function anadoluYakasindaMi(enlem, boylam) {
  if (enlem == null || boylam == null) return false
  return (
    enlem >= ANADOLU_BBOX.minEnlem &&
    enlem <= ANADOLU_BBOX.maxEnlem &&
    boylam >= ANADOLU_BBOX.minBoylam &&
    boylam <= ANADOLU_BBOX.maxBoylam
  )
}

// İki koordinat arası mesafe (km) — Haversine formülü
export function mesafeKm(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some(v => v == null)) return null
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Tarayıcı/cihazdan anlık konum al (GPS iznini tetikler)
export function konumAl() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Cihazın/tarayıcın konum desteklemiyor.'))
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ enlem: pos.coords.latitude, boylam: pos.coords.longitude, dogruluk: pos.coords.accuracy }),
      err => {
        let m = 'Konum alınamadı.'
        if (err.code === 1) m = 'Konum izni reddedildi. Telefon/tarayıcı ayarlarından bu siteye konum izni ver.'
        else if (err.code === 2) m = 'Konum bilgisi alınamadı (sinyal/GPS yok).'
        else if (err.code === 3) m = 'Konum isteği zaman aşımına uğradı. Tekrar dene.'
        reject(new Error(m))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  })
}
