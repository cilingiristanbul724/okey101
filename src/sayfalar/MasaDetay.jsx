import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Chat from './Chat'
import GeriSayim from '../utils/GeriSayim'
import Durum from '../Durum'
import { konumAl, mesafeKm } from '../utils/konum'
import { onay } from '../utils/onay'

const yesilButon = { background: 'linear-gradient(180deg, #16a34a, #15803d)' }
const tehlikeButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)' }
const altinButon = { background: 'linear-gradient(180deg, #e8b923, #c99a12)', color: '#2a2200' }
const griButon = { background: '#6b7280' }

function Avatar({ p }) {
  if (p && p.foto_url) return <img className="avatar" src={p.foto_url} alt="" />
  const harf = ((p && (p.kullanici_adi || p.ad_soyad)) || '?').charAt(0).toUpperCase()
  return <div className="avatar avatar-bos">{harf}</div>
}

export default function MasaDetay() {
  const { id } = useParams()
  const [masa, setMasa] = useState(null)
  const [acan, setAcan] = useState(null)
  const [oyuncular, setOyuncular] = useState([])
  const [benimId, setBenimId] = useState(null)
  const [uzaklik, setUzaklik] = useState(null)
  const [iliskiler, setIliskiler] = useState([])
  const [duzenleMod, setDuzenleMod] = useState(false)
  const [yeniBaslik, setYeniBaslik] = useState('')
  const [yeniSure, setYeniSure] = useState(30)

  async function yukle() {
    const res = await supabase.auth.getUser()
    const uid = res.data.user ? res.data.user.id : null
    setBenimId(uid)

    const { data: m } = await supabase.from('masalar').select('*').eq('id', id).single()
    let masaSon = m
    if (m && uid === m.acan_id && m.durum === 'Acik' && m.bitis_zamani && new Date(m.bitis_zamani).getTime() < Date.now()) {
      await supabase.from('masalar').update({ durum: 'Kapali' }).eq('id', id)
      masaSon = { ...m, durum: 'Kapali' }
    }
    setMasa(masaSon)
    if (masaSon) {
      setYeniBaslik(masaSon.baslik || masaSon.mekan_adi || '')
      setYeniSure(masaSon.sure_dk || 30)
      const { data: ap } = await supabase.from('profiles').select('id,kullanici_adi,ad_soyad,foto_url,son_gorulme').eq('id', masaSon.acan_id).single()
      setAcan(ap)
      if (masaSon.enlem != null) {
        konumAl().then(k => setUzaklik(mesafeKm(k.enlem, k.boylam, masaSon.enlem, masaSon.boylam))).catch(() => {})
      }
    }

    const { data: o } = await supabase.from('masa_oyunculari').select('*').eq('masa_id', id)
    const oyl = o || []
    const idler = oyl.map(x => x.oyuncu_id)
    const harita = {}
    if (idler.length) {
      const { data: pr } = await supabase.from('profiles').select('id,kullanici_adi,ad_soyad,foto_url,son_gorulme').in('id', idler)
      for (const p of pr || []) harita[p.id] = p
    }
    setOyuncular(oyl.map(x => ({ ...x, profil: harita[x.oyuncu_id] })))

    if (uid) {
      const { data: rel } = await supabase.from('arkadaslar').select('isteyen_id,istenen_id,durum')
        .or('isteyen_id.eq.' + uid + ',istenen_id.eq.' + uid)
      setIliskiler(rel || [])
    }
  }
  useEffect(() => { yukle() }, [id])

  function iliskiDurum(hedefId) {
    const r = iliskiler.find(x =>
      (x.isteyen_id === benimId && x.istenen_id === hedefId) ||
      (x.isteyen_id === hedefId && x.istenen_id === benimId))
    return r ? r.durum : null
  }

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
    const mevcut = iliskiDurum(hedefId)
    if (mevcut === 'Kabul') return alert('Zaten arkadaşsınız.')
    if (mevcut === 'Beklemede') return alert('Arkadaşlık isteği zaten var.')
    const { error } = await supabase.from('arkadaslar').insert({ isteyen_id: benimId, istenen_id: hedefId, durum: 'Beklemede' })
    if (error) { alert('İstek gönderilemedi: ' + error.message); return }
    alert('Arkadaşlık isteği gönderildi.')
    yukle()
  }
  async function bulusmaPaylas() {
    try {
      const k = await konumAl()
      const link = 'https://www.google.com/maps/dir/?api=1&destination=' + k.enlem + ',' + k.boylam
      await supabase.from('mesajlar').insert({ masa_id: id, gonderen_id: benimId, icerik: '📍 Canlı konumum: ' + link })
      alert('Canlı konumun sohbete paylaşıldı.')
    } catch (e) {
      alert('Konum alınamadı: ' + e.message)
    }
  }
  async function masayiKapat() {
    const ok = await onay('Masayı kapatmak istediğine emin misin?', { baslik: 'Masayı Kapat', onayMetin: 'Kapat', tehlike: true })
    if (!ok) return
    await supabase.from('masalar').update({ durum: 'Kapali' }).eq('id', id)
    yukle()
  }
  async function duzenleKaydet() {
    const sure = Number(yeniSure) || 30
    const bitis = new Date(Date.now() + sure * 60000).toISOString()
    const { error } = await supabase.from('masalar').update({ baslik: yeniBaslik.trim() || null, sure_dk: sure, bitis_zamani: bitis }).eq('id', id)
    if (error) return alert('Kaydedilemedi: ' + error.message)
    setDuzenleMod(false)
    yukle()
  }

  if (!masa) return <p className="sayfa">Masa yükleniyor...</p>
  const sahibiMiyim = benimId && benimId === masa.acan_id
  const masadaMiyim = oyuncular.some(o => o.oyuncu_id === benimId)
  const acikMi = masa.durum === 'Acik'
  const yolTarifi = masa.enlem != null
    ? 'https://www.google.com/maps/dir/?api=1&destination=' + masa.enlem + ',' + masa.boylam
    : null

  function ad(p, fallback) { return p ? (p.kullanici_adi || p.ad_soyad || fallback) : fallback }

  function ArkadasButon({ hedefId }) {
    if (!hedefId || hedefId === benimId) return null
    const d = iliskiDurum(hedefId)
    if (d === 'Kabul') return <span className="rozet rozet-yesil">✓ Arkadaş</span>
    if (d === 'Beklemede') return <span className="ipucu">İstek gönderildi</span>
    return <button onClick={() => arkadasEkle(hedefId)} style={altinButon}>Arkadaş Ekle</button>
  }

  return (
    <div className="sayfa">
      <h2>{masa.baslik || masa.mekan_adi || 'Masa Detayı'}</h2>

      <div className="kart">
        <div className="kart-bas">
          <span>Durum: {masa.durum}</span>
          {acikMi ? <GeriSayim bitis={masa.bitis_zamani} /> : <span className="rozet rozet-kirmizi">Kapalı</span>}
        </div>
        {masa.mekan_adi && <p><b>{masa.mekan_adi}</b></p>}
        <p>📍 {masa.adres}</p>
        {masa.notu && <p>Not: {masa.notu}</p>}
        {uzaklik != null && <p className="mesafe">Sana {uzaklik.toFixed(1)} km uzaklıkta</p>}
        {yolTarifi && <a href={yolTarifi} target="_blank" rel="noreferrer">🧭 Yol tarifi al</a>}
      </div>

      {sahibiMiyim && acikMi && !duzenleMod && (
        <div>
          <button onClick={() => setDuzenleMod(true)} style={altinButon}>Masayı Düzenle</button>
          <button onClick={masayiKapat} style={tehlikeButon}>Masayı Kapat</button>
        </div>
      )}

      {sahibiMiyim && duzenleMod && (
        <div className="kart">
          <label>Başlık</label>
          <input value={yeniBaslik} onChange={e => setYeniBaslik(e.target.value)} placeholder="Masa başlığı" />
          <label>Süre</label>
          <select value={yeniSure} onChange={e => setYeniSure(Number(e.target.value))}>
            <option value={15}>15 dakika</option>
            <option value={30}>30 dakika</option>
            <option value={60}>60 dakika</option>
          </select>
          <button onClick={duzenleKaydet} style={yesilButon}>Kaydet</button>
          <button onClick={() => setDuzenleMod(false)} style={griButon}>Vazgeç</button>
        </div>
      )}

      <button onClick={bulusmaPaylas} style={yesilButon}>📍 Buluşma / Canlı Konum Paylaş</button>
      {masadaMiyim && !sahibiMiyim && (
        <button onClick={masadanCik} style={tehlikeButon}>Masadan Çık</button>
      )}

      <h3>Masa Sahibi</h3>
      <div className="kart satir">
        <Avatar p={acan} />
        <div className="satir-icerik">
          {acan
            ? <Link to={'/uye/' + acan.id} className="uye-ad-link">{ad(acan, 'Masa sahibi')}</Link>
            : <div>Masa sahibi</div>}
          {acan && <Durum sonGorulme={acan.son_gorulme} />}
        </div>
        {acan && <ArkadasButon hedefId={acan.id} />}
      </div>

      <h3>Katılımcılar</h3>
      {oyuncular.length === 0 && <p className="ipucu">Henüz katılımcı yok.</p>}
      {oyuncular.map(o => (
        <div key={o.id} className="kart satir">
          <Avatar p={o.profil} />
          <div className="satir-icerik">
            <Link to={'/uye/' + o.oyuncu_id} className="uye-ad-link">{ad(o.profil, 'Oyuncu')}</Link>
            {o.profil && <Durum sonGorulme={o.profil.son_gorulme} />}
            <div className="ipucu">{o.katilim_durumu}</div>
          </div>
          <ArkadasButon hedefId={o.oyuncu_id} />
          {sahibiMiyim && o.katilim_durumu === 'Talep' && (
            <span>
              <button onClick={() => onayla(o.id)}>Onayla</button>
              <button onClick={() => reddet(o.id)} style={tehlikeButon}>Reddet</button>
            </span>
          )}
        </div>
      ))}

      <Chat masaId={masa.id} sahibiMiyim={sahibiMiyim} />
    </div>
  )
}
