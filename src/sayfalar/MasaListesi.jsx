import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { konumAl, mesafeKm, anadoluYakasindaMi } from '../utils/konum'
import GeriSayim from '../utils/GeriSayim'
import Ikon from '../Ikon'
import Tanitim from '../Tanitim'

const inceleButon = { background: 'transparent', border: '1px solid #e8b923', color: '#e8b923', boxShadow: 'none' }

function masaAcikMi(m) {
  if (m.durum !== 'Acik') return false
  if (m.bitis_zamani && new Date(m.bitis_zamani).getTime() <= Date.now()) return false
  return true
}

export default function MasaListesi() {
  const [masalar, setMasalar] = useState([])
  const [konum, setKonum] = useState(null)
  const [konumDurum, setKonumDurum] = useState('Konum alınıyor...')
  const [benimId, setBenimId] = useState(null)
  const [katildiklarim, setKatildiklarim] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(res => setBenimId(res.data.user ? res.data.user.id : null))
  }, [])

  useEffect(() => {
    konumAl()
      .then(k => { setKonum(k); setKonumDurum('') })
      .catch(() => setKonumDurum('Konum alınamadı — mesafeler gösterilemeyebilir.'))
  }, [])

  useEffect(() => {
    supabase.from('masalar').select('*').eq('durum', 'Acik')
      .then(({ data }) => setMasalar(data || []))
  }, [])

  useEffect(() => {
    if (!benimId) return
    supabase.from('masa_oyunculari').select('masa_id,katilim_durumu').eq('oyuncu_id', benimId)
      .then(({ data }) => setKatildiklarim((data || []).filter(x => x.katilim_durumu !== 'Red').map(x => x.masa_id)))
  }, [benimId])

  async function katil(masaId) {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) return alert('Önce giriş yapmalısın!')

    // Bir uye ayni anda yalnizca 1 masaya katilabilir
    const { data: katilimlarim } = await supabase.from('masa_oyunculari')
      .select('masa_id,katilim_durumu').eq('oyuncu_id', user.id)
      .in('katilim_durumu', ['Talep', 'Onayli'])
    const digerIdler = [...new Set((katilimlarim || []).map(x => x.masa_id).filter(mid => mid !== masaId))]
    if (digerIdler.length) {
      const { data: digerMasalar } = await supabase.from('masalar')
        .select('id,bitis_zamani').in('id', digerIdler).eq('durum', 'Acik')
      const aktifKatilimVar = (digerMasalar || []).some(m => !m.bitis_zamani || new Date(m.bitis_zamani).getTime() > Date.now())
      if (aktifKatilimVar) return alert('Aynı anda yalnızca bir masaya katılabilirsin. Önce mevcut masadan çıkman gerekiyor.')
    }

    const { error } = await supabase.from('masa_oyunculari')
      .insert({ masa_id: masaId, oyuncu_id: user.id, katilim_durumu: 'Talep' })
    if (error) return alert(error.message)
    setKatildiklarim(eski => eski.includes(masaId) ? eski : [...eski, masaId])
    alert('Katılım talebin gönderildi!')
  }

  function benimleIlgili(m) {
    if (benimId && m.acan_id === benimId) return true
    if (katildiklarim.includes(m.id)) return true
    return false
  }

  const liste = masalar
    .filter(masaAcikMi)
    .filter(m => benimleIlgili(m) || anadoluYakasindaMi(m.enlem, m.boylam))
    .map(m => ({
      ...m,
      uzaklik: konum ? mesafeKm(konum.enlem, konum.boylam, m.enlem, m.boylam) : null,
      benim: benimId && m.acan_id === benimId,
      katildim: katildiklarim.includes(m.id),
    }))
    .sort((a, b) => {
      if (a.uzaklik == null) return 1
      if (b.uzaklik == null) return -1
      return a.uzaklik - b.uzaklik
    })

  return (
    <div className="sayfa">
      <Tanitim />
      <h2>Açık Masalar — İstanbul Anadolu Yakası</h2>
      {konumDurum && <p className="ipucu">{konumDurum}</p>}
      {liste.length === 0 && <p>Şu an yakınında açık masa yok. İlk masayı sen aç!</p>}
      {liste.map(m => (
        <div key={m.id} className="kart kart-masa">
          <div className="kart-bas">
            <b>{m.baslik || m.mekan_adi || 'Masa'}</b>
            <GeriSayim bitis={m.bitis_zamani} />
          </div>
          {m.baslik && m.mekan_adi && <div className="ipucu">{m.mekan_adi}</div>}
          <div>{m.adres}</div>
          <div>Aranan kişi: {m.aranan_kisi}</div>
          {m.uzaklik != null && (
            <div className="mesafe"><Ikon ad="pin" boyut={14} /> {m.uzaklik.toFixed(1)} km uzaklıkta</div>
          )}
          {m.notu && <div className="kart-not">Not: {m.notu}</div>}
          <div className="kart-aksiyon">
            {m.benim ? (
              <span className="rozet rozet-yesil">Senin masan</span>
            ) : m.katildim ? (
              <span className="rozet rozet-yesil">Katıldın</span>
            ) : (
              <button onClick={() => katil(m.id)}>Katıl</button>
            )}
            <Link to={'/masa/' + m.id}><button style={inceleButon}>İncele</button></Link>
          </div>
        </div>
      ))}
    </div>
  )
}
