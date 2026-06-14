import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import KonumSecici from '../KonumSecici'

export default function MasaAc() {
  const [baslik, setBaslik] = useState('')
  const [arananKisi, setArananKisi] = useState(1)
  const [sure, setSure] = useState(30)
  const [mekanAdi, setMekanAdi] = useState('')
  const [adres, setAdres] = useState('')
  const [enlem, setEnlem] = useState(null)
  const [boylam, setBoylam] = useState(null)
  const [notu, setNotu] = useState('')
  const navigate = useNavigate()

  async function masaAc() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) return alert('Önce giriş yapmalısın!')
    if (!mekanAdi.trim() || !adres.trim()) return alert('Mekan adı ve açık adres zorunlu.')
    if (enlem == null || boylam == null) return alert('Lütfen "Buradayım" ile konumunu işaretle.')
    const bitis = new Date(Date.now() + sure * 60000).toISOString()
    const { error } = await supabase.from('masalar').insert({
      acan_id: user.id, baslik: baslik.trim() || null,
      aranan_kisi: Number(arananKisi), mevcut_kisi: 4 - Number(arananKisi),
      mekan_adi: mekanAdi.trim(), adres: adres.trim(), enlem, boylam,
      sure_dk: sure, bitis_zamani: bitis, notu, durum: 'Acik',
    })
    if (error) return alert(error.message)
    alert('Masa açıldı! Geri sayım başladı.')
    navigate('/')
  }

  return (
    <div className="sayfa">
      <h2>Masa Aç <span className="altin">(eksik oyuncu aranıyor)</span></h2>

      <div className="masa-uyari">
        <b>📍 Bu bir fiziksel buluşma ilanıdır.</b>
        <p>Açtığın masa, belirttiğin mekanda <b>yüz yüze</b> okey/101 oynamak içindir — sitede online oyun oynanmaz. Yakınındaki oyuncular ilanı görüp katılma talebi gönderecek.</p>
      </div>

      <label>Masa başlığı</label>
      <input value={baslik} onChange={e => setBaslik(e.target.value)} placeholder="Örn. ACİL 2 KİŞİ ARANIYOR YER PENDİK" />

      <label>Kaç kişi aranıyor?</label>
      <div className="secim-grup">
        {[1, 2, 3].map(n => (
          <button key={n} type="button"
            className={'secim-btn' + (Number(arananKisi) === n ? ' secim-aktif' : '')}
            onClick={() => setArananKisi(n)}>{n}</button>
        ))}
      </div>

      <label>Masa süresi</label>
      <select value={sure} onChange={e => setSure(Number(e.target.value))}>
        <option value={15}>15 dakika</option>
        <option value={30}>30 dakika</option>
        <option value={60}>1 saat</option>
      </select>

      <label>Mekan adı</label>
      <input value={mekanAdi} onChange={e => setMekanAdi(e.target.value)} placeholder="Örn. Anadolu Kıraathanesi" />

      <label>Açık adres</label>
      <input value={adres} onChange={e => setAdres(e.target.value)} placeholder="Mahalle, cadde, sokak, kapı no..." />

      <label>Konum</label>
      <KonumSecici enlem={enlem} boylam={boylam} onDegis={(la, lo) => { setEnlem(la); setBoylam(lo) }} />

      <label>Not</label>
      <input value={notu} onChange={e => setNotu(e.target.value)} placeholder="İstersen kısa bir not ekle" />

      <button onClick={masaAc}>İlanı Yayınla</button>
    </div>
  )
}
