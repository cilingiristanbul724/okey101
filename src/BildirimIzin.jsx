import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { pushDestekleniyorMu, pushAboneOl, pushSessizYenile, VAPID_PUBLIC } from './utils/push'

const sarmal = {
  position: 'fixed', left: '12px', right: '12px', bottom: '86px', zIndex: 9000,
  maxWidth: '460px', margin: '0 auto',
  background: 'linear-gradient(160deg,#0e3a2a,#0a2c20)', border: '1px solid #1c5a42',
  borderRadius: '14px', padding: '13px 15px', boxShadow: '0 12px 34px rgba(0,0,0,.5)',
  color: '#eaf3ee', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px',
}
const metinStil = { lineHeight: 1.45, fontWeight: 500, color: '#dbeee4' }
const aksiyonStil = { display: 'flex', gap: '8px', justifyContent: 'flex-end' }
const acStil = {
  margin: 0, padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: 700,
  background: 'linear-gradient(180deg,#e8b923,#c99a12)', color: '#2a2200',
}
const kapatStil = {
  margin: 0, padding: '8px 14px', borderRadius: '10px', boxShadow: 'none',
  background: 'transparent', border: '1px solid #2a6b50', color: '#cfe3d8',
}

export default function BildirimIzin() {
  const [goster, setGoster] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [kullaniciId, setKullaniciId] = useState(null)

  useEffect(() => {
    let iptal = false
    async function kontrol() {
      if (!pushDestekleniyorMu()) return
      if (!VAPID_PUBLIC || VAPID_PUBLIC.startsWith('BURAYA')) return
      const res = await supabase.auth.getUser()
      const uid = res.data.user ? res.data.user.id : null
      if (iptal || !uid) return
      setKullaniciId(uid)
      if (Notification.permission === 'granted') {
        pushSessizYenile(uid)
      } else if (Notification.permission === 'default') {
        setGoster(true)
      }
    }
    kontrol()
    return () => { iptal = true }
  }, [])

  async function ac() {
    setYukleniyor(true)
    try {
      await pushAboneOl(kullaniciId)
      window.dispatchEvent(new CustomEvent('okey-bildir', { detail: { mesaj: 'Bildirimler açıldı! Masan için artık haber alacaksın.' } }))
      setGoster(false)
    } catch (e) {
      window.dispatchEvent(new CustomEvent('okey-bildir', { detail: { mesaj: 'Bildirim açılamadı: ' + e.message } }))
    } finally {
      setYukleniyor(false)
    }
  }

  if (!goster) return null
  return (
    <div style={sarmal}>
      <span style={metinStil}>🔔 Masana katılım talebi geldiğinde veya sohbete mesaj yazıldığında telefonundan haber almak ister misin?</span>
      <div style={aksiyonStil}>
        <button style={kapatStil} onClick={() => setGoster(false)}>Sonra</button>
        <button style={acStil} onClick={ac} disabled={yukleniyor}>{yukleniyor ? '...' : 'Bildirimleri Aç'}</button>
      </div>
    </div>
  )
}
