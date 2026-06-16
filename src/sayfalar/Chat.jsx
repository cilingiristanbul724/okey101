import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { kufurTemizle } from '../utils/kufur'
import { engellenenleriGetir } from '../utils/moderasyon'
import { onay } from '../utils/onay'
import { pushTetikle } from '../utils/push'
import EmojiSec from '../EmojiSec'

function MesajIcerigi({ metin }) {
  const temiz = kufurTemizle(metin)
  const parcalar = (temiz || '').split(/(https?:\/\/[^\s]+)/g)
  return parcalar.map((p, i) => {
    if (/^https?:\/\//.test(p)) {
      const haritaLinki = p.includes('/maps/dir') || p.includes('/maps?') || p.includes('maps.google')
      return (
        <a key={i} href={p} target="_blank" rel="noreferrer">
          {haritaLinki ? '🧭 Yol tarifi al' : p}
        </a>
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

export default function Chat({ masaId, sahibiMiyim }) {
  const [mesajlar, setMesajlar] = useState([])
  const [profiller, setProfiller] = useState({})
  const [metin, setMetin] = useState('')
  const [benimId, setBenimId] = useState(null)
  const [engellenenler, setEngellenenler] = useState([])
  const govdeRef = useRef(null)

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

  async function profilGetir(idler) {
    const eksik = [...new Set(idler)].filter(Boolean)
    if (!eksik.length) return
    const { data } = await supabase.from('profiles').select('id, kullanici_adi, ad_soyad, foto_url').in('id', eksik)
    if (data) setProfiller(o => { const y = { ...o }; for (const p of data) y[p.id] = p; return y })
  }

  useEffect(() => {
    let iptal = false
    supabase.from('mesajlar').select('*').eq('masa_id', masaId).order('created_at')
      .then(({ data }) => {
        if (iptal) return
        setMesajlar(data || [])
        profilGetir((data || []).map(m => m.gonderen_id))
      })

    const kanal = supabase.channel('mesajlar-' + masaId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mesajlar', filter: 'masa_id=eq.' + masaId },
        payload => { setMesajlar(eski => [...eski, payload.new]); profilGetir([payload.new.gonderen_id]) }
      )
      .subscribe()
    return () => { iptal = true; supabase.removeChannel(kanal) }
  }, [masaId])

  useEffect(() => {
    const g = govdeRef.current
    if (g) g.scrollTop = g.scrollHeight
  }, [mesajlar])

  async function gonder() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user || !metin.trim()) return
    const icerik = metin.trim()
    await supabase.from('mesajlar').insert({ masa_id: masaId, gonderen_id: user.id, icerik })
    pushTetikle('mesajlar', { masa_id: masaId, gonderen_id: user.id, icerik })
    setMetin('')
  }

  async function temizle() {
    const ok = await onay('Tüm masa sohbeti silinsin mi? Bu işlem geri alınamaz.', { baslik: 'Sohbeti Temizle', onayMetin: 'Sil', tehlike: true })
    if (!ok) return
    const { error } = await supabase.from('mesajlar').delete().eq('masa_id', masaId)
    if (error) return alert('Silinemedi: ' + error.message)
    setMesajlar([])
  }

  function saat(t) {
    if (!t) return ''
    return new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  const gorunen = mesajlar.filter(m => !engellenenler.includes(m.gonderen_id))

  return (
    <div className="sohbet">
      <div className="sohbet-bas">
        <h3>Masa Sohbeti</h3>
        {sahibiMiyim && gorunen.length > 0 && (
          <button type="button" onClick={temizle} className="btn-kirmizi sohbet-temizle">Sohbeti temizle</button>
        )}
      </div>
      <div className="sohbet-govde" ref={govdeRef}>
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
      </div>
      <div className="sohbet-giris">
        <EmojiSec onSec={e => setMetin(m => m + e)} />
        <input value={metin} onChange={e => setMetin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && gonder()} placeholder="Mesaj yaz..." />
        <button onClick={gonder}>Gönder</button>
      </div>
    </div>
  )
}
