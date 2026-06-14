import { useEffect, useState } from 'react'

const SECICI = '.avatar, .msj-avatar, .profil-foto, .buyutulebilir'

export default function FotoOnizleme() {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    function tikla(e) {
      const t = e.target
      if (t && t.tagName === 'IMG' && t.matches(SECICI)) {
        const s = t.getAttribute('src')
        if (s) { e.stopPropagation(); setSrc(s) }
      }
    }
    document.addEventListener('click', tikla)
    return () => document.removeEventListener('click', tikla)
  }, [])

  useEffect(() => {
    function esc(e) { if (e.key === 'Escape') setSrc(null) }
    if (src) document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [src])

  if (!src) return null
  return (
    <div className="foto-onizleme" onClick={() => setSrc(null)}>
      <button className="foto-kapat" onClick={() => setSrc(null)} aria-label="Kapat">×</button>
      <img src={src} alt="" onClick={e => e.stopPropagation()} />
    </div>
  )
}
