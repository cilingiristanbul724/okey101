import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminPanel() {
  const [basvurular, setBasvurular] = useState([])

  async function yenile() {
    const { data } = await supabase.from('mekanlar')
      .select('*').eq('durum', 'Beklemede')
    setBasvurular(data || [])
  }
  useEffect(() => { yenile() }, [])

  async function onayla(id) {
    await supabase.from('mekanlar').update({ durum: 'Onayli' }).eq('id', id)
    yenile()
  }
  async function cikar(id) {
    await supabase.from('mekanlar').update({ durum: 'Red' }).eq('id', id)
    yenile()
  }

  return (
    <div className="sayfa">
      <h2>Admin — Mekan Başvuruları</h2>
      {basvurular.length === 0 && <p>Bekleyen başvuru yok.</p>}
      {basvurular.map(m => (
        <div key={m.id} className="kart">
          <b>{m.ad}</b> — {m.adres}
          <button onClick={() => onayla(m.id)}>Onayla</button>
          <button onClick={() => cikar(m.id)}>Çıkar</button>
        </div>
      ))}
    </div>
  )
}