import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

// Mesaj içindeki linkleri tıklanabilir yapar. Konum/harita linkleri
// "🧭 Yol tarifi al" olarak gösterilir (WhatsApp tarzı).
function MesajIcerigi({ metin }) {
  const parcalar = (metin || '').split(/(https?:\/\/[^\s]+)/g)
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

export default function Chat({ masaId }) {
  const [mesajlar, setMesajlar] = useState([])
  const [metin, setMetin] = useState('')
  const [benimId, setBenimId] = useState(null)
  const sonRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(res => setBenimId(res.data.user ? res.data.user.id : null))
  }, [])

  useEffect(() => {
    supabase.from('mesajlar').select('*, profiles(kullanici_adi)')
      .eq('masa_id', masaId).order('created_at')
      .then(({ data }) => setMesajlar(data || []))

    const kanal = supabase.channel('mesajlar-' + masaId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mesajlar', filter: 'masa_id=eq.' + masaId },
        payload => setMesajlar(eski => [...eski, payload.new])
      )
      .subscribe()
    return () => { supabase.removeChannel(kanal) }
  }, [masaId])

  useEffect(() => {
    sonRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mesajlar])

  async function gonder() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user || !metin.trim()) return
    await supabase.from('mesajlar').insert({
      masa_id: masaId, gonderen_id: user.id, icerik: metin.trim(),
    })
    setMetin('')
  }

  function saat(t) {
    if (!t) return ''
    return new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="sohbet">
      <h3>Masa Sohbeti</h3>
      <div className="sohbet-govde">
        {mesajlar.map(m => {
          const benimMi = m.gonderen_id === benimId
          const ad = m.profiles?.kullanici_adi || 'Oyuncu'
          return (
            <div key={m.id} className={'balon ' + (benimMi ? 'balon-ben' : 'balon-diger')}>
              {!benimMi && <div className="balon-ad">{ad}</div>}
              <div className="balon-metin"><MesajIcerigi metin={m.icerik} /></div>
              <div className="balon-saat">{saat(m.created_at)}</div>
            </div>
          )
        })}
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
