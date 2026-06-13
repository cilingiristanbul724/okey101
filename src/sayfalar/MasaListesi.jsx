import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { konumAl, mesafeKm, anadoluYakasindaMi } from '../utils/konum'
import GeriSayim from '../utils/GeriSayim'

const griButon = { background: '#6b7280' }

export default function MasaListesi() {
  const [masalar, setMasalar] = useState([])
  const [konum, setKonum] = useState(null)
  const [konumDurum, setKonumDurum] = useState('Konum alınıyor...')

  useEffect(() => {
    konumAl()
      .then(k => { setKonum(k); setKonumDurum('') })
      .catch(() => setKonumDurum('Konum alınamadı — mesafeler gösterilemeyebilir.'))
  }, [])

  useEffect(() => {
    supabase.from('masalar').select('*').eq('durum', 'Acik')
      .then(({ data }) => setMasalar(data || []))
  }, [])

  async function katil(masaId) {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) return alert('Önce giriş yapmalısın!')
    const { error } = await supabase.from('masa_oyunculari')
      .insert({ masa_id: masaId, oyuncu_id: user.id, katilim_durumu: 'Talep' })
    alert(error ? error.message : 'Katılım talebin gönderildi!')
  }

  const liste = masalar
    .filter(m => anadoluYakasindaMi(m.enlem, m.boylam))
    .map(m => ({
      ...m,
      uzaklik: konum ? mesafeKm(konum.enlem, konum.boylam, m.enlem, m.boylam) : null,
    }))
    .sort((a, b) => {
      if (a.uzaklik == null) return 1
      if (b.uzaklik == null) return -1
      return a.uzaklik - b.uzaklik
    })

  return (
    <div className="sayfa">
      <h2>Açık Masalar — İstanbul Anadolu Yakası</h2>
      {konumDurum && <p className="ipucu">{konumDurum}</p>}
      {liste.length === 0 && <p>Şu an yakınında açık masa yok. İlk masayı sen aç!</p>}
      {liste.map(m => (
        <div key={m.id} className="kart">
          <div className="kart-bas">
            <b>{m.mekan_adi || 'Masa'}</b>
            <GeriSayim bitis={m.bitis_zamani} />
          </div>
          <div>{m.adres}</div>
          <div>Aranan kişi: {m.aranan_kisi}</div>
          {m.uzaklik != null && (
            <div className="mesafe">📍 {m.uzaklik.toFixed(1)} km uzaklıkta</div>
          )}
          {m.notu && <div>Not: {m.notu}</div>}
          <button onClick={() => katil(m.id)}>Katıl</button>
          <Link to={'/masa/' + m.id}><button style={griButon}>Detay</button></Link>
        </div>
      ))}
    </div>
  )
}
