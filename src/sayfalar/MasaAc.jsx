import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function MasaAc() {
  const [arananKisi, setArananKisi] = useState(1)
  const [zaman, setZaman] = useState('')
  const [notu, setNotu] = useState('')

  async function masaAc() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) return alert('Önce giriş yapmalısın!')

    const { error } = await supabase.from('masalar').insert({
      acan_id: user.id,
      aranan_kisi: Number(arananKisi),
      mevcut_kisi: 4 - Number(arananKisi),
      oynama_zamani: zaman || null,
      notu: notu,
      durum: 'Acik',
    })
    alert(error ? error.message : 'Masa açıldı! İlanın yayında.')
  }

  return (
    <div className="sayfa">
      <h2>Masa Aç (4. arkadaş aranıyor)</h2>
      <label>Kaç kişi aranıyor?</label>
      <input type="number" min="1" max="3" value={arananKisi}
        onChange={e => setArananKisi(e.target.value)} />
      <label>Oynama zamanı</label>
      <input type="datetime-local" value={zaman} onChange={e => setZaman(e.target.value)} />
      <label>Not</label>
      <input value={notu} onChange={e => setNotu(e.target.value)} />
      <button onClick={masaAc}>İlanı Yayınla</button>
    </div>
  )
}