import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Chat from './Chat'
import GeriSayim from '../utils/GeriSayim'
import { konumAl, mesafeKm } from '../utils/konum'

const yesilButon = { background: 'linear-gradient(180deg, #16a34a, #15803d)' }
const tehlikeButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)' }
const altinButon = { background: 'linear-gradient(180deg, #e8b923, #c99a12)', color: '#2a2200' }

export default function MasaDetay() {
  const { id } = useParams()
  const [masa, setMasa] = useState(null)
  const [acan, setAcan] = useState(null)
  const [oyuncular, setOyuncular] = useState([])
  const [benimId, setBenimId] = useState(null)
  const [uzaklik, setUzaklik] = useState(null)

  async function yukle() {
    const res = await supabase.auth.getUser()
    const uid = res.data.user ? res.data.user.id : null
    setBenimId(uid)

    const { data: m } = await supabase.from('masalar').select('*').eq('id', id).single()
    setMasa(m)
    if (m) {
      const { data: ap } = await supabase.from('profiles').select('id,kullanici_adi,ad_soyad').eq('id', m.acan_id).single()
      setAcan(ap)
      if (m.enlem != null) {
        konumAl().then(k => setUzaklik(mesafeKm(k.enlem, k.boylam, m.enlem, m.boylam))).catch(() => {})
      }
    }

    const { data: o } = await supabase.from('masa_oyunculari').select('*').eq('masa_id', id)
    const oyl = o || []
    const idler = oyl.map(x => x.oyuncu_id)
    const harita = {}
    if (idler.length) {
      const { data: pr } = await supabase.from('profiles').select('id,kullanici_adi,ad_soyad').in('id', idler)
      for (const p of pr || []) harita[p.id] = p
    }
    setOyuncular(oyl.map(x => ({ ...x, profil: harita[x.oyuncu_id] })))
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
  async function arkadasEkle(hedefId) {
    if (!benimId || !hedefId || hedefId === benimId) return
    const { error } = await supabase.from('arkadaslar').insert({ isteyen_id: benimId, istenen_id: hedefId, durum: 'Beklemede' })
    alert(error ? 'İstek gönderilemedi (belki zaten gönderdin): ' + error.message : 'Arkadaşlık isteği gönderildi 👍')
  }
  async function bulusmaPaylas() {
    try {
      const k = await konumAl()
      const link = 'https://www.google.com/maps/dir/?api=1&destination=' + k.enlem + ',' + k.boylam
      await supabase.from('mesajlar').insert({ masa_id: id, gonderen_id: benimId, icerik: '📍 Canlı konumum: ' + link })
      alert('Canlı konumun sohbete paylaşıldı. Tıklayan kişi direkt yol tarifi alır.')
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

  function ad(p, fallback) { return p ? (p.kullanici_adi || p.ad_soyad || fallback) : fallback }

  return (
    <div className="sayfa">
      <h2>{masa.mekan_adi || 'Masa Detayı'}</h2>

      <div className="kart">
        <div className="kart-bas">
          <span>Durum: {masa.durum}</span>
          <GeriSayim bitis={masa.bitis_zamani} />
        </div>
        <p>📍 {masa.adres}</p>
        {uzaklik != null && <p className="mesafe">Sana {uzaklik.toFixed(1)} km uzaklıkta</p>}
        {yolTarifi && <a href={yolTarifi} target="_blank" rel="noreferrer">🧭 Yol tarifi al</a>}
      </div>

      <button onClick={bulusmaPaylas} style={yesilButon}>📍 Buluşma / Canlı Konum Paylaş</button>
      {masadaMiyim && !sahibiMiyim && (
        <button onClick={masadanCik} style={tehlikeButon}>Masadan Çık</button>
      )}

      <h3>Masa Sahibi</h3>
      <div className="kart satir">
        <div className="avatar avatar-bos">{ad(acan, '?').charAt(0).toUpperCase()}</div>
        <div className="satir-icerik"><div>{ad(acan, 'Masa sahibi')}</div></div>
        {acan && acan.id !== benimId && (
          <button onClick={() => arkadasEkle(acan.id)} style={altinButon}>Arkadaş Ekle</button>
        )}
      </div>

      <h3>Katılımcılar</h3>
      {oyuncular.length === 0 && <p className="ipucu">Henüz katılımcı yok.</p>}
      {oyuncular.map(o => (
        <div key={o.id} className="kart satir">
          <div className="avatar avatar-bos">{ad(o.profil, '?').charAt(0).toUpperCase()}</div>
          <div className="satir-icerik">
            <div>{ad(o.profil, 'Oyuncu')}</div>
            <div className="ipucu">{o.katilim_durumu}</div>
          </div>
          {o.oyuncu_id !== benimId && (
            <button onClick={() => arkadasEkle(o.oyuncu_id)} style={altinButon}>Arkadaş Ekle</button>
          )}
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
