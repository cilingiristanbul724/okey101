import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function MekanKayit() {
  const [ad, setAd] = useState('')
  const [adres, setAdres] = useState('')
  const [enlem, setEnlem] = useState('')
  const [boylam, setBoylam] = useState('')
  const [kapasite, setKapasite] = useState('')

  async function basvur() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) return alert('Önce giriş yapmalısın!')

    const { error } = await supabase.from('mekanlar').insert({
      ad, adres,
      enlem: enlem ? Number(enlem) : null,
      boylam: boylam ? Number(boylam) : null,
      kapasite: kapasite ? Number(kapasite) : null,
      sahip_id: user.id,
      durum: 'Beklemede',
    })
    alert(error ? error.message : 'Başvurun alındı! Admin onayından sonra haritada görünür.')
  }

  return (
    <div className="sayfa">
      <h2>Mekan Kayıt (Mekan Sahibi)</h2>
      <input placeholder="Mekan adı" value={ad} onChange={e => setAd(e.target.value)} />
      <input placeholder="Adres" value={adres} onChange={e => setAdres(e.target.value)} />
      <input placeholder="Enlem (örn 41.0082)" value={enlem} onChange={e => setEnlem(e.target.value)} />
      <input placeholder="Boylam (örn 28.9784)" value={boylam} onChange={e => setBoylam(e.target.value)} />
      <input placeholder="Kapasite" value={kapasite} onChange={e => setKapasite(e.target.value)} />
      <button onClick={basvur}>Başvuruyu Gönder</button>
    </div>
  )
}