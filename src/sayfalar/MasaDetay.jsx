import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Chat from './Chat'
import GeriSayim from '../utils/GeriSayim'
import { konumAl, mesafeKm } from '../utils/konum'

const yesilButon = { background: '#059669' }
const tehlikeButon = { background: '#dc2626' }

export default function MasaDetay() {
  const { id } = useParams()
  const [masa, setMasa] = useState(null)
  const [oyuncular, setOyuncular] = useState([])
  const [benimId, setBenimId] = useState(null)
  const [uzaklik, setUzaklik] = useState(null)

  async function yukle() {
    const res = await supabase.auth.getUser()
    const uid = res.data.user ? res.data.user.id : null
    setBenimId(uid)

    const { data: m } = await supabase.from('masalar').select('*').eq('id', id).single()
    setMasa(m)

    const { data: o } = await supabase.from('masa_oyunculari')
      .select('*, profiles(kullanici_adi, ad_soyad)').eq('masa_id', id)
    setOyuncular(o || [])

    if (m && m.enlem != null) {
      konumAl()
        .then(k => setUzaklik(mesafeKm(k.enlem, k.boylam, m.enlem, m.boylam)))
        .catch(() => {})
    }
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
  async function masadanCik() {
    if (!benimId) return
    await supabase.from('masa_oyunculari').delete().eq('masa_id', id).eq('oyuncu_id', benimId)
    alert('Masadan çıktın.')
    yukle()
  }

  async function bulusmaPaylas() {
    try {
      const k = await konumAl()
      const link = 'https://www.google.com/maps?q=' + k.enlem + ',' + k.boylam
      await supabase.from('mesajlar').insert({
        masa_id: id, gonderen_id: benimId,
        icerik: '📍 Canlı konumum: ' + link,
      })
      alert('Canlı konumun sohbete paylaşıldı.')
    } catch (e) {
      alert('Konum alınamadı: ' + e.message)
    }
  }

  if (!masa) return <p className="sayfa">Masa yükleniyor...</p>
  const sahibiMiyim = benimId && benimId === masa.acan_id
  const masadaMiyim = oyuncular.some(o => o.oyuncu_id === benimId)
  const yolTarifi = masa.enlem != null
    ? 'https://www.google.com/maps/dir/?api=1&destination=' + masa.enlem + ',' + masa.boylam
    : null

  return (
    <div className="sayfa">
      <h2>{masa.mekan_adi || 'Masa Detayı'}</h2>
      <div className="kart">
        <div className="kart-bas">
          <span>Durum: {masa.durum}</span>
          <GeriSayim bitis={masa.bitis_zamani} />
        </div>
        <p>{masa.adres}</p>
        {uzaklik != null && <p className="mesafe">📍 Sana {uzaklik.toFixed(1)} km uzaklıkta</p>}
        {yolTarifi && <a href={yolTarifi} target="_blank" rel="noreferrer">🧭 Yol tarifi al</a>}
      </div>

      <button onClick={bulusmaPaylas} style={yesilButon}>📍 Buluşma / Canlı Konum Paylaş</button>
      {masadaMiyim && !sahibiMiyim && (
        <button onClick={masadanCik} style={tehlikeButon}>Masadan Çık</button>
      )}

      <h3>Katılımcılar</h3>
      {oyuncular.map(o => (
        <div key={o.id} className="kart">
          {o.profiles ? (o.profiles.kullanici_adi || o.profiles.ad_soyad) : o.oyuncu_id} — {o.katilim_durumu}
          {sahibiMiyim && o.katilim_durumu === 'Talep' && (
            <span>
              <button onClick={() => onayla(o.id)}>Onayla</button>
              <button onClick={() => reddet(o.id)} style={tehlikeButon}>Reddet</button>
            </span>
          )}
        </div>
      ))}

      <Chat masaId={masa.id} />
    </div>
  )
}
