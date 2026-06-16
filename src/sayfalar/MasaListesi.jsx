import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { zamanMs } from '../utils/zaman'
import { pushTetikle } from '../utils/push'
import { engellenenleriGetir } from '../utils/moderasyon'
import GeriSayim from '../utils/GeriSayim'
import Ikon from '../Ikon'
import Tanitim from '../Tanitim'

const ikonYesil = { background: 'linear-gradient(135deg, #16a34a, #15803d)' }
const ikonAltin = { background: 'linear-gradient(135deg, #f6d65b, #e8b923)', color: '#2a2200' }
const ikonMavi = { background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }
const acanAd = { color: '#9fb8ab' }

function masaAcikMi(m) {
  if (m.durum !== 'Acik') return false
  if (m.bitis_zamani && zamanMs(m.bitis_zamani) <= Date.now()) return false
  return true
}

export default function MasaListesi() {
  const [masalar, setMasalar] = useState([])
  const [acanlar, setAcanlar] = useState({})
  const [doluluk, setDoluluk] = useState({})
  const [benimId, setBenimId] = useState(null)
  const [katildiklarim, setKatildiklarim] = useState([])
  const [engellenenler, setEngellenenler] = useState([])
  const [hepsi, setHepsi] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async res => {
      const uid = res.data.user ? res.data.user.id : null
      setBenimId(uid)
      if (uid) setEngellenenler(await engellenenleriGetir(uid))
    })
  }, [])

  useEffect(() => {
    supabase.from('masalar').select('*').eq('durum', 'Acik')
      .then(async ({ data }) => {
        const ms = data || []
        setMasalar(ms)
        const idler = [...new Set(ms.map(m => m.acan_id).filter(Boolean))]
        if (idler.length) {
          const { data: pr } = await supabase.from('profiles').select('id,cinsiyet,kullanici_adi').in('id', idler)
          const h = {}
          for (const p of pr || []) h[p.id] = p
          setAcanlar(h)
        }
        const masaIdler = ms.map(m => m.id)
        if (masaIdler.length) {
          const { data: oyuncular } = await supabase.from('masa_oyunculari')
            .select('masa_id').eq('katilim_durumu', 'Onayli').in('masa_id', masaIdler)
          const say = {}
          for (const o of oyuncular || []) say[o.masa_id] = (say[o.masa_id] || 0) + 1
          setDoluluk(say)
        }
      })
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

    const { data: katilimlarim } = await supabase.from('masa_oyunculari')
      .select('masa_id,katilim_durumu').eq('oyuncu_id', user.id)
      .in('katilim_durumu', ['Talep', 'Onayli'])
    const digerIdler = [...new Set((katilimlarim || []).map(x => x.masa_id).filter(mid => mid !== masaId))]
    if (digerIdler.length) {
      const { data: digerMasalar } = await supabase.from('masalar')
        .select('id,bitis_zamani').in('id', digerIdler).eq('durum', 'Acik')
      const aktifKatilimVar = (digerMasalar || []).some(m => !m.bitis_zamani || zamanMs(m.bitis_zamani) > Date.now())
      if (aktifKatilimVar) return alert('Aynı anda yalnızca bir masaya katılabilirsin. Önce mevcut masadan çıkman gerekiyor.')
    }

    const { error } = await supabase.from('masa_oyunculari')
      .insert({ masa_id: masaId, oyuncu_id: user.id, katilim_durumu: 'Talep' })
    if (error) return alert(error.message)
    pushTetikle('masa_oyunculari', { masa_id: masaId, oyuncu_id: user.id, katilim_durumu: 'Talep' })
    setKatildiklarim(eski => eski.includes(masaId) ? eski : [...eski, masaId])
    alert('Katılım talebin gönderildi!')
  }

  const liste = masalar
    .filter(masaAcikMi)
    .filter(m => !engellenenler.includes(m.acan_id))
    .map(m => ({
      ...m,
      benim: benimId && m.acan_id === benimId,
      katildim: katildiklarim.includes(m.id),
    }))

  const gosterilen = hepsi ? liste : liste.slice(0, 5)

  return (
    <div className="sayfa">
      <Tanitim />

      <div className="bolum-bas"><h3>Hızlı İşlemler</h3></div>
      <div className="hizli-liste">
        <Link to="/arkadaslar" className="hizli-kart">
          <div className="hizli-ikon" style={ikonYesil}><Ikon ad="arkadaslar" boyut={22} /></div>
          <div className="hizli-metin"><b>Oyuncu Ara</b><span>Yakındaki oyuncuları bul</span></div>
          <span className="hizli-ok"><Ikon ad="oksag" boyut={18} /></span>
        </Link>
        <Link to="/masa-ac" className="hizli-kart">
          <div className="hizli-ikon" style={ikonAltin}><Ikon ad="masalar" boyut={22} /></div>
          <div className="hizli-metin"><b>Masa Kur</b><span>Yeni masa aç ve oyuncu bekle</span></div>
          <span className="hizli-ok"><Ikon ad="oksag" boyut={18} /></span>
        </Link>
        <Link to="/bildirimler" className="hizli-kart">
          <div className="hizli-ikon" style={ikonMavi}><Ikon ad="zil" boyut={22} /></div>
          <div className="hizli-metin"><b>Masa Davetleri</b><span>Davet et, birlikte oynayın</span></div>
          <span className="hizli-ok"><Ikon ad="oksag" boyut={18} /></span>
        </Link>
      </div>

      <div className="bolum-bas">
        <h3>Aktif Masalar</h3>
        {liste.length > 5 && (
          <button className="tumunu-gor" onClick={() => setHepsi(v => !v)}>{hepsi ? 'Daha az' : 'Tümünü Gör'}</button>
        )}
      </div>
      {liste.length === 0 && <p>Şu an açık masa yok. İlk masayı sen aç!</p>}
      {gosterilen.map(m => {
        const acanP = acanlar[m.acan_id]
        const dolu = (doluluk[m.id] || 0) + 1
        return (
          <div key={m.id} className="masa-satir">
            <Link to={'/masa/' + m.id} className="masa-satir-ic">
              <div className="masa-satir-ikon"><Ikon ad="masalar" boyut={20} /></div>
              <div className="masa-satir-metin">
                <div className="masa-satir-bas">
                  <span>{m.baslik || m.mekan_adi || '101 Okey Masası'}</span>
                </div>
                <div className="masa-satir-alt">
                  {acanP && acanP.kullanici_adi && <span style={acanAd}>@{acanP.kullanici_adi}</span>}
                  <span>{dolu}/4 Kişi</span>
                  <GeriSayim bitis={m.bitis_zamani} />
                </div>
              </div>
            </Link>
            <div className="masa-satir-sag">
              {m.benim ? (
                <span className="rozet rozet-yesil">Senin masan</span>
              ) : m.katildim ? (
                <span className="rozet rozet-yesil">Katıldın</span>
              ) : (
                <button className="katil-btn" onClick={() => katil(m.id)}>Katıl</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
