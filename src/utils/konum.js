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

function hataMesaji(err) {
  if (err && err.code === 1) return 'Konum izni reddedildi. Telefon/tarayıcı ayarlarından bu siteye konum izni ver.'
  if (err && err.code === 2) return 'Konum bilgisi alınamadı (sinyal/GPS yok).'
  if (err && err.code === 3) return 'Konum isteği zaman aşımına uğradı. Tekrar dene.'
  return 'Konum alınamadı.'
}

// Tarayıcı/cihazdan anlık konum al (GPS iznini tetikler).
// Yuksek hassasiyet basarisiz olursa dusuk hassasiyetle tekrar dener.
export function konumAl() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Cihazın/tarayıcın konum desteklemiyor.'))

    const basari = pos => resolve({
      enlem: pos.coords.latitude,
      boylam: pos.coords.longitude,
      dogruluk: pos.coords.accuracy,
    })

    function dene(yuksek, sonDeneme) {
      navigator.geolocation.getCurrentPosition(
        basari,
        err => {
          // Izin reddi disindaki hatalarda dusuk hassasiyetle bir kez daha dene
          if (!sonDeneme && err && err.code !== 1) {
            dene(false, true)
          } else {
            reject(new Error(hataMesaji(err)))
          }
        },
        yuksek
          ? { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
          : { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      )
    }

    dene(true, false)
  })
}
