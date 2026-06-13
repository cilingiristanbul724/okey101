import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { konumAl, anadoluYakasindaMi } from '../utils/konum'

const yesilButon = { background: '#059669' }

export default function MasaAc() {
  const [arananKisi, setArananKisi] = useState(1)
  const [sure, setSure] = useState(30)
  const [mekanAdi, setMekanAdi] = useState('')
  const [adres, setAdres] = useState('')
  const [enlem, setEnlem] = useState(null)
  const [boylam, setBoylam] = useState(null)
  const [notu, setNotu] = useState('')
  const [konumDurum, setKonumDurum] = useState('')
  const navigate = useNavigate()

  async function buradayim() {
    setKonumDurum('Konum alınıyor...')
    try {
      const k = await konumAl()
      setEnlem(k.enlem); setBoylam(k.boylam)
      setKonumDurum(anadoluYakasindaMi(k.enlem, k.boylam)
        ? '📍 Konum alındı (' + k.enlem.toFixed(4) + ', ' + k.boylam.toFixed(4) + ')'
        : '⚠️ Konumun İstanbul Anadolu Yakası dışında görünüyor. Pilot bölge şimdilik sadece Anadolu Yakası.')
    } catch (e) {
      setKonumDurum('Konum alınamadı: ' + e.message)
    }
  }

  async function masaAc() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) return alert('Önce giriş yapmalısın!')
    if (!mekanAdi.trim() || !adres.trim()) return alert('Mekan adı ve açık adres zorunlu.')
    if (enlem == null || boylam == null) return alert('Lütfen "Buradayım" ile konumunu işaretle.')

    const bitis = new Date(Date.now() + sure * 60000).toISOString()
    const { error } = await supabase.from('masalar').insert({
      acan_id: user.id,
      aranan_kisi: Number(arananKisi),
      mevcut_kisi: 4 - Number(arananKisi),
      mekan_adi: mekanAdi.trim(),
      adres: adres.trim(),
      enlem, boylam,
      sure_dk: sure,
      bitis_zamani: bitis,
      notu,
      durum: 'Acik',
    })
    if (error) return alert(error.message)
    alert('Masa açıldı! Geri sayım başladı.')
    navigate('/')
  }

  return (
    <div className="sayfa">
      <h2>Masa Aç (eksik oyuncu aranıyor)</h2>

      <label>Kaç kişi aranıyor?</label>
      <input type="number" min="1" max="3" value={arananKisi} onChange={e => setArananKisi(e.target.value)} />

      <label>Masa süresi</label>
      <select value={sure} onChange={e => setSure(Number(e.target.value))}>
        <option value={15}>15 dakika</option>
        <option value={30}>30 dakika</option>
        <option value={60}>1 saat</option>
      </select>

      <label>Mekan adı</label>
      <input value={mekanAdi} onChange={e => setMekanAdi(e.target.value)} placeholder="Örn. Anadolu Kıraathanesi" />

      <label>Açık adres</label>
      <input value={adres} onChange={e => setAdres(e.target.value)} placeholder="Mahalle, cadde, no..." />

      <label>Konum</label>
      <button onClick={buradayim} style={yesilButon}>📍 Buradayım (konumu işaretle)</button>
      {konumDurum && <p>{konumDurum}</p>}

      <label>Not</label>
      <input value={notu} onChange={e => setNotu(e.target.value)} />

      <button onClick={masaAc}>İlanı Yayınla</button>
    </div>
  )
}
