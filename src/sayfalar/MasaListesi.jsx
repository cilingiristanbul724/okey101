import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function MasaListesi() {
  const [masalar, setMasalar] = useState([])

  useEffect(() => {
    supabase.from('masalar').select('*').eq('durum', 'Acik')
      .then(({ data }) => setMasalar(data || []))
  }, [])

  async function katil(masaId) {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) return alert('Önce giriş yapmalısın!')
    const { error } = await supabase.from('masa_oyunculari')
      .insert({ masa_id: masaId, oyuncu_id: user.id })
    alert(error ? error.message : 'Katılım talebin gönderildi!')
  }

  return (
    <div className="sayfa">
      <h2>Açık Masalar (4. aranıyor)</h2>
      {masalar.length === 0 && <p>Şu an açık masa yok. İlk masayı sen aç!</p>}
      {masalar.map(m => (
        <div key={m.id} className="kart">
          <div>Aranan kişi: {m.aranan_kisi} | Durum: {m.durum}</div>
          {m.notu && <div>Not: {m.notu}</div>}
          <button onClick={() => katil(m.id)}>Katıl</button>
          <Link to={'/masa/' + m.id}>
            <button>Detay</button>
          </Link>
        </div>
      ))}
    </div>
  )
}