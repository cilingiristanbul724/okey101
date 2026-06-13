import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function OzelSohbet() {
  const { digerId } = useParams()
  const [benimId, setBenimId] = useState(null)
  const [mesajlar, setMesajlar] = useState([])
  const [diger, setDiger] = useState(null)
  const [metin, setMetin] = useState('')
  const sonRef = useRef(null)

  async function yukle(uid) {
    const { data } = await supabase.from('ozel_mesajlar').select('*')
      .or('and(gonderen_id.eq.' + uid + ',alici_id.eq.' + digerId + '),and(gonderen_id.eq.' + digerId + ',alici_id.eq.' + uid + ')')
      .order('created_at')
    setMesajlar(data || [])
  }

  useEffect(() => {
    async function baslat() {
      const res = await supabase.auth.getUser()
      const uid = res.data.user ? res.data.user.id : null
      setBenimId(uid)
      const { data: p } = await supabase.from('profiles').select('kullanici_adi, ad_soyad').eq('id', digerId).single()
      setDiger(p)
      if (uid) yukle(uid)
    }
    baslat()

    const kanal = supabase.channel('ozel-' + digerId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ozel_mesajlar' },
        () => supabase.auth.getUser().then(r => r.data.user && yukle(r.data.user.id))
      )
      .subscribe()
    return () => { supabase.removeChannel(kanal) }
  }, [digerId])

  useEffect(() => { sonRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mesajlar])

  async function gonder() {
    if (!benimId || !metin.trim()) return
    await supabase.from('ozel_mesajlar').insert({
      gonderen_id: benimId, alici_id: digerId, icerik: metin.trim(),
    })
    setMetin('')
  }
  function saat(t) {
    return t ? new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''
  }

  if (!benimId) return <p className="sayfa">Giriş yapmalısın.</p>

  return (
    <div className="sayfa">
      <h2>{diger ? (diger.kullanici_adi || diger.ad_soyad) : 'Özel Sohbet'}</h2>
      <div className="sohbet-govde">
        {mesajlar.map(m => (
          <div key={m.id} className={'balon ' + (m.gonderen_id === benimId ? 'balon-ben' : 'balon-diger')}>
            <div className="balon-metin">{m.icerik}</div>
            <div className="balon-saat">{saat(m.created_at)}</div>
          </div>
        ))}
        <div ref={sonRef} />
      </div>
      <div className="sohbet-giris">
        <input value={metin} onChange={e => setMetin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && gonder()} placeholder="Mesaj yaz..." />
        <button onClick={gonder}>Gönder</button>
      </div>
    </div>
  )
}
