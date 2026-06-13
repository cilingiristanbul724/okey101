import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const kartLink = { display: 'block', textDecoration: 'none', color: 'inherit' }

export default function MesajKutusu() {
  const [benimId, setBenimId] = useState(null)
  const [sohbetler, setSohbetler] = useState([])

  useEffect(() => {
    async function yukle() {
      const res = await supabase.auth.getUser()
      const uid = res.data.user ? res.data.user.id : null
      setBenimId(uid)
      if (!uid) return

      const { data } = await supabase.from('ozel_mesajlar')
        .select('*, gonderen:profiles!ozel_mesajlar_gonderen_id_fkey(id,kullanici_adi), alici:profiles!ozel_mesajlar_alici_id_fkey(id,kullanici_adi)')
        .or('gonderen_id.eq.' + uid + ',alici_id.eq.' + uid)
        .order('created_at', { ascending: false })

      const harita = new Map()
      for (const m of data || []) {
        const karsi = m.gonderen_id === uid ? m.alici : m.gonderen
        if (!karsi) continue
        if (!harita.has(karsi.id)) harita.set(karsi.id, { kisi: karsi, sonMesaj: m })
      }
      setSohbetler([...harita.values()])
    }
    yukle()
  }, [])

  if (!benimId) return <p className="sayfa">Mesaj kutusu için giriş yapmalısın.</p>

  return (
    <div className="sayfa">
      <h2>Mesaj Kutusu</h2>
      {sohbetler.length === 0 && <p>Henüz özel mesajın yok. Arkadaşlar sayfasından mesaj atabilirsin.</p>}
      {sohbetler.map(s => (
        <Link key={s.kisi.id} to={'/ozel/' + s.kisi.id} className="kart" style={kartLink}>
          <b>{s.kisi.kullanici_adi || 'Kullanıcı'}</b>
          <div>{s.sonMesaj.icerik}</div>
        </Link>
      ))}
    </div>
  )
}
