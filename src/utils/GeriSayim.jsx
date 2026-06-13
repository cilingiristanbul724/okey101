import { useEffect, useState } from 'react'

function hesapla(bitis) {
  if (!bitis) return 0
  return new Date(bitis).getTime() - Date.now()
}

export default function GeriSayim({ bitis }) {
  const [kalan, setKalan] = useState(() => hesapla(bitis))
  useEffect(() => {
    const t = setInterval(() => setKalan(hesapla(bitis)), 1000)
    return () => clearInterval(t)
  }, [bitis])

  if (!bitis) return null
  if (kalan <= 0) return <span className="rozet rozet-kirmizi">Süre doldu</span>

  const dk = Math.floor(kalan / 60000)
  const sn = Math.floor((kalan % 60000) / 1000)
  return (
    <span className="rozet rozet-yesil">⏳ {dk}:{String(sn).padStart(2, '0')}</span>
  )
}
