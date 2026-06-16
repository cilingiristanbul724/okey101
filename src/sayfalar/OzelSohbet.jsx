import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Durum from '../Durum'
import { kufurTemizle } from '../utils/kufur'
import { aramizdaEngelVarMi } from '../utils/moderasyon'
import EmojiSec from '../EmojiSec'
import { pushTetikle } from '../utils/push'

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

export default function OzelSohbet() {
  const { digerId } = useParams()
  const [benimId, setBenimId] = useState(null)
  const [mesajlar, setMesajlar] = useState([])
  const [diger, setDiger] = useState(null)
  const [arkadasMi, setArkadasMi] = useState(false)
  const [engelli, setEngelli] = useState(false)
  const [metin, setMetin] = useState('')
  const sonRef = useRef(null)

  async function yukle(uid) {
    const { data } = await supabase.from('ozel_mesajlar').select('*')
      .or('and(gonderen_id.eq.' + uid + ',alici_id.eq.' + digerId + '),and(gonderen_id.eq.' + digerId + ',alici_id.eq.' + uid + ')')
      .order('created_at')
    setMesajlar(data || [])
  }

  async function digerGetir() {
    const { data: p } = await supabase.from('profiles').select('kullanici_adi, ad_soyad, foto_url, son_gorulme').eq('id', digerId).single()
    if (p) setDiger(p)
  }

  async function arkadasKontrol(uid) {
    const { data } = await supabase.from('arkadaslar').select('id')
      .eq('durum', 'Kabul')
      .or('and(isteyen_id.eq.' + uid + ',istenen_id.eq.' + digerId + '),and(isteyen_id.eq.' + digerId + ',istenen_id.eq.' + uid + ')')
    setArkadasMi(!!(data && data.length > 0))
  }

  useEffect(() => {
    async function baslat() {
      const res = await supabase.auth.getUser()
      const uid = res.data.user ? res.data.user.id : null
      setBenimId(uid)
      await digerGetir()
      if (uid) {
        await arkadasKontrol(uid)
        setEngelli(await aramizdaEngelVarMi(uid, digerId))
        yukle(uid)
      }
    }
    baslat()

    const kanal = supabase.channel('ozel-' + digerId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ozel_mesajlar' },
        () => supabase.auth.getUser().then(r => r.data.user && yukle(r.data.user.id)))
      .subscribe()

    const z = setInterval(digerGetir, 30000)

    return () => { supabase.removeChannel(kanal); clearInterval(z) }
  }, [digerId])

  useEffect(() => {
    sonRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mesajlar])

  async function gonder() {
    if (!benimId || !metin.trim() || engelli) return
    const icerik = metin.trim()
    await supabase.from('ozel_mesajlar').insert({ gonderen_id: benimId, alici_id: digerId, icerik })
    pushTetikle('ozel_mesajlar', { gonderen_id: benimId, alici_id: digerId, icerik })
    setMetin('')
  }
  function saat(t) {
    return t ? new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''
  }

  if (!benimId) return <p className="sayfa">Giriş yapmalısın.</p>
  const yazabilir = arkadasMi && !engelli

  return (
    <div className="sayfa">
      <div className="ozel-bas">
        {diger
          ? <Link to={'/uye/' + digerId} className="ozel-ad-link"><h2>{diger.kullanici_adi || diger.ad_soyad}</h2></Link>
          : <h2>Özel Sohbet</h2>}
        {diger && <Durum sonGorulme={diger.son_gorulme} />}
      </div>
      {engelli && (
        <div className="kart"><p className="ipucu">Bu kullanıcıyla aranızda engelleme var, mesajlaşamazsınız.</p></div>
      )}
      {!engelli && !arkadasMi && (
        <div className="kart"><p className="ipucu">Mesajlaşabilmek için önce arkadaş olmanız gerekiyor.</p></div>
      )}
      <div className="sohbet-govde">
        {mesajlar.map(m => (
          <div key={m.id} className={'balon ' + (m.gonderen_id === benimId ? 'balon-ben' : 'balon-diger')}>
            <div className="balon-metin"><MesajIcerigi metin={m.icerik} /></div>
            <div className="balon-saat">{saat(m.created_at)}</div>
          </div>
        ))}
        <div ref={sonRef} />
      </div>
      {yazabilir && (
        <div className="sohbet-giris">
          <EmojiSec onSec={e => setMetin(m => m + e)} />
          <input value={metin} onChange={e => setMetin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && gonder()} placeholder="Mesaj yaz..." />
          <button onClick={gonder}>Gönder</button>
        </div>
      )}
    </div>
  )
}
