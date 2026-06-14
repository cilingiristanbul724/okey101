import { useEffect, useState } from 'react'

let sayac = 0

const RENK = { basari: '#22c55e', hata: '#f59e0b', bilgi: '#38bdf8' }
const IKON = { basari: '✅', hata: '⚠️', bilgi: 'ℹ️' }

function tahminTip(m) {
  const s = String(m).toLowerCase()
  if (/(başarısız|hata|zorunlu|gerekli|yanlış|bulunamad|olmal|en az|lütfen|onaylamal|geçersiz|izin|unuttum)/.test(s)) return 'hata'
  if (/(başarılı|açıldı|güncellendi|kaydedildi|hoş geldin|gönderildi|eklendi|kabul)/.test(s)) return 'basari'
  return 'bilgi'
}

export default function Bildirim() {
  const [liste, setListe] = useState([])

  useEffect(() => {
    function ekle(e) {
      const mesaj = (e.detail && e.detail.mesaj) || ''
      const tip = (e.detail && e.detail.tip) || tahminTip(mesaj)
      const id = ++sayac
      setListe(l => [...l, { id, mesaj, tip }])
      setTimeout(() => setListe(l => l.filter(t => t.id !== id)), 4000)
    }
    window.addEventListener('okey-bildir', ekle)
    // Tarayicinin cirkin alert kutusu yerine sik bildirim goster
    const eskiAlert = window.alert
    window.alert = (m) => window.dispatchEvent(new CustomEvent('okey-bildir', { detail: { mesaj: String(m) } }))
    return () => {
      window.removeEventListener('okey-bildir', ekle)
      window.alert = eskiAlert
    }
  }, [])

  function kapat(id) { setListe(l => l.filter(t => t.id !== id)) }

  const sarici = {
    position: 'fixed', top: '14px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '8px',
    width: 'min(440px, calc(100vw - 24px))', pointerEvents: 'none',
  }

  return (
    <div style={sarici}>
      <style>{'@keyframes bildirGir{from{opacity:0;transform:translateY(-14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}'}</style>
      {liste.map(t => (
        <div key={t.id} onClick={() => kapat(t.id)} style=
          pointerEvents: 'auto', display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '13px 14px', borderRadius: '14px', cursor: 'pointer',
          background: 'linear-gradient(160deg,#0e3a2a,#0a2c20)', border: '1px solid #1c5a42',
          borderLeft: '4px solid ' + RENK[t.tip], boxShadow: '0 10px 30px rgba(0,0,0,.45)',
          color: '#eaf3ee', fontSize: '14px', lineHeight: 1.45, fontWeight: 600,
          animation: 'bildirGir .28s ease-out',
        >
          <span style= fontSize: '17px', lineHeight: 1.2, flexShrink: 0 >{IKON[t.tip]}</span>
          <span style= flex: 1, wordBreak: 'break-word' >{t.mesaj}</span>
          <span style= color: '#7fa394', fontSize: '18px', lineHeight: 1, flexShrink: 0 >×</span>
        </div>
      ))}
    </div>
  )
}
