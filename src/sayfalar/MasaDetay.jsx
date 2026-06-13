import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Chat from './Chat'
import BulusmaOnay from './BulusmaOnay'

export default function MasaDetay() {
  const { id } = useParams()
  const [masa, setMasa] = useState(null)
  const [oyuncular, setOyuncular] = useState([])
  const [benimId, setBenimId] = useState(null)

  async function yukle() {
    const res = await supabase.auth.getUser()
    setBenimId(res.data.user ? res.data.user.id : null)

    const { data: m } = await supabase.from('masalar').select('*').eq('id', id).single()
    setMasa(m)

    const { data: o } = await supabase.from('masa_oyunculari')
      .select('*, profiles(ad)').eq('masa_id', id)
    setOyuncular(o || [])
  }
  useEffect(() => { yukle() }, [id])

  async function onayla(satirId) {
    await supabase.from('masa_oyunculari').update({ katilim_durumu: 'Onayli' }).eq('id', satirId)
    yukle()
  }
  async function reddet(satirId) {
    await supabase.from('masa_oyunculari').update({ katilim_durumu: 'Red' }).eq('id', satirId)
    yukle()
  }

  if (!masa) return <p className="sayfa">Masa yükleniyor...</p>
  const sahibiMiyim = benimId && benimId === masa.acan_id

  return (
    <div className="sayfa">
      <h2>Masa Detayı</h2>
      <p>Durum: {masa.durum} | Aranan kişi: {masa.aranan_kisi}</p>

      <h3>Katılımcılar</h3>
      {oyuncular.map(o => (
        <div key={o.id} className="kart">
          {o.profiles ? o.profiles.ad : o.oyuncu_id} — {o.katilim_durumu}
          {sahibiMiyim && o.katilim_durumu === 'Talep' && (
            <span>
              <button onClick={() => onayla(o.id)}>Onayla</button>
              <button onClick={() => reddet(o.id)}>Reddet</button>
            </span>
          )}
        </div>
      ))}

      <BulusmaOnay masaId={masa.id} />
      <Chat masaId={masa.id} />
    </div>
  )
}