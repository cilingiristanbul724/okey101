import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { kufurTemizle } from '../utils/kufur'
import { engellenenleriGetir } from '../utils/moderasyon'
import EmojiSec from '../EmojiSec'

function MesajIcerigi({ metin }) {
  const temiz = kufurTemizle(metin)
  const parcalar = (temiz || '').split(/(https?:\/\/[^\s]+)/g)
  return parcalar.map((p, i) => {
    if (/^https?:\/\//.test(p)) {
      const haritaLinki = p.includes('/maps/dir') || p.includes('/maps?') || p.includes('maps.google')
      return (
        <a key={i} href={p} target="_blank" rel="noreferrer">{haritaLinki ? '🧭 Yol tarifi al' : p}</a>
      )
    }
    return <span key={i}>{p}</span>
  })
}

function Avatar({ p }) {
  if (p && p.foto_url) return <img className="msj-avatar" src={p.foto_url} alt="" />
  const harf = ((p && (p.kullanici_adi || p.ad_soyad)) || '?').charAt(0).toUpperCase()
  return <div className="msj-avatar msj-avatar-bos">{harf}</div>
}

const govdeStil = { minHeight: '56vh', maxHeight: '70vh' }

export default function Lobi() {
  const [mesajlar, setMesajlar] = useState([])
  const [profiller, setProfiller] = useState({})
  const [metin, setMetin] = useState('')
  const [benimId, setBenimId] = useState(null)
  const [engellenenler, setEngellenenler] = useState([])
  const sonRef = useRef(null)

  async function profilGetir(idler) {
    const eksik = [...new Set(idler)].filter(Boolean)
    if (!eksik.length) return
    const { data } = await supabase.from('profiles').select('id, kullanici_adi, ad_soyad, foto_url').in('id', eksik)
    if (data) setProfiller(o => { const y = { ...o }; for (const p of data) y[p.id] = p; return y })
  }

  useEffect(() => {
    supabase.auth.getUser().then(async res => {
      const uid = res.data.user ? res.data.user.id : null
      setBenimId(uid)
      if (uid) {
        profilGetir([uid])
        setEngellenenler(await engellenenleriGetir(uid))
      }
    })
  }, [])

  useEffect(() => {
    let iptal = false
    supabase.from('genel_mesajlar').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => {
        if (iptal) return
        const sirali = (data || []).slice().reverse()
        setMesajlar(sirali)
        profilGetir(sirali.map(m => m.gonderen_id))
      })
    const kanal = supabase.channel('genel-mesajlar')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'genel_mesajlar' },
        payload => { setMesajlar(eski => [...eski, payload.new]); profilGetir([payload.new.gonderen_id]) })
      .subscribe()
    return () => { iptal = true; supabase.removeChannel(kanal) }
  }, [])

  useEffect(() => { sonRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mesajlar])

  async function gonder() {
    if (!benimId || !metin.trim()) return
    const t = metin.trim()
    setMetin('')
    const { error } = await supabase.from('genel_mesajlar').insert({ gonderen_id: benimId, icerik: t })
    if (error) alert('Gönderilemedi: ' + error.message)
  }

  function saat(t) { return t ? new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '' }

  const gorunen = mesajlar.filter(m => !engellenenler.includes(m.gonderen_id))

  return (
    <div className="sayfa">
      <h2>Genel Sohbet</h2>
      <p className="ipucu">Tüm üyelerin birbiriyle yazıştığı halka açık kanal.</p>
      <div className="sohbet">
        <div className="sohbet-govde" style={govdeStil}>
          {gorunen.length === 0 && <p className="ipucu">Henüz mesaj yok. İlk yazan sen ol!</p>}
          {gorunen.map(m => {
            const benimMi = m.gonderen_id === benimId
            const p = profiller[m.gonderen_id]
            const ad = (p && (p.kullanici_adi || p.ad_soyad)) || (benimMi ? 'Sen' : 'Oyuncu')
            return (
              <div key={m.id} className={'msj-satir ' + (benimMi ? 'msj-ben' : 'msj-diger')}>
                <Avatar p={p} />
                <div className={'balon ' + (benimMi ? 'balon-ben' : 'balon-diger')}>
                  {benimMi
                    ? <div className="balon-ad">{ad}</div>
                    : <Link className="balon-ad balon-ad-link" to={'/uye/' + m.gonderen_id}>{ad}</Link>}
                  <div className="balon-metin"><MesajIcerigi metin={m.icerik} /></div>
                  <div className="balon-saat">{saat(m.created_at)}</div>
                </div>
              </div>
            )
          })}
          <div ref={sonRef} />
        </div>
        {benimId ? (
          <div className="sohbet-giris">
            <EmojiSec onSec={e => setMetin(m => m + e)} />
            <input value={metin} onChange={e => setMetin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && gonder()} placeholder="Herkese yaz..." />
            <button onClick={gonder}>Gönder</button>
          </div>
        ) : (
          <p className="ipucu">Yazabilmek için giriş yapmalısın.</p>
        )}
      </div>
    </div>
  )
}
