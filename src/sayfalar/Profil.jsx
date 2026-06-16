import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Ikon from '../Ikon'

const cikisButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)', marginTop: 8 }
const kaydetButon = { background: 'linear-gradient(180deg, #16a34a, #15803d)' }
const kameraBtn = { display: 'inline-flex', alignItems: 'center', gap: '8px' }

const basKart = { display: 'flex', alignItems: 'center', gap: 14, padding: 16 }
const avatarImg = { width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }
const onlineNokta = { position: 'absolute', right: 0, bottom: 2, width: 16, height: 16, borderRadius: '50%', background: '#22c55e', border: '3px solid #0b2e23' }
const menuSatirStil = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', marginBottom: 8 }
const menuEtiketStil = { flex: 1, fontWeight: 600 }
const okStil = { opacity: 0.5 }
const avatarSarmal = { position: 'relative', flexShrink: 0 }
const basBilgi = { minWidth: 0 }
const basAd = { fontWeight: 800, fontSize: 18 }
const menuIkonStil = (renk) => ({ width: 38, height: 38, borderRadius: 10, background: renk, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })

const cinsiyetRenk = {
  'Kadın': '#ec4899',
  'Erkek': '#3b82f6',
  'Belirtmek istemiyorum': '#6b7280',
}
function cinsiyetIkon(c) {
  if (c === 'Kadın') return 'kadin'
  if (c === 'Erkek') return 'erkek'
  return 'kullanici'
}

function MenuSatir({ ikon, renk, etiket, to }) {
  return (
    <Link to={to} className="kart" style={menuSatirStil}>
      <div style={menuIkonStil(renk)}><Ikon ad={ikon} boyut={18} /></div>
      <span style={menuEtiketStil}>{etiket}</span>
      <span style={okStil}><Ikon ad="oksag" boyut={18} /></span>
    </Link>
  )
}

export default function Profil() {
  const [profil, setProfil] = useState(null)
  const [adSoyad, setAdSoyad] = useState('')
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [cinsiyet, setCinsiyet] = useState('Belirtmek istemiyorum')
  const [kayitDurum, setKayitDurum] = useState('')
  const [hazir, setHazir] = useState(false)
  const [duzenleAcik, setDuzenleAcik] = useState(false)
  const navigate = useNavigate()

  async function yukle() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) { setProfil(null); setHazir(true); return }
    await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfil(data)
    if (data) {
      setAdSoyad(data.ad_soyad || '')
      setKullaniciAdi(data.kullanici_adi || '')
      setCinsiyet(data.cinsiyet || 'Belirtmek istemiyorum')
      if (!data.kullanici_adi) setDuzenleAcik(true)
    }
    setHazir(true)
  }
  useEffect(() => { yukle() }, [])

  async function fotoSec(e) {
    const dosya = e.target.files && e.target.files[0]
    if (!dosya || !profil) return
    setKayitDurum('Fotoğraf yükleniyor...')
    const uzanti = (dosya.name.split('.').pop() || 'jpg').toLowerCase()
    const yol = profil.id + '/avatar_' + Date.now() + '.' + uzanti
    const yukleme = await supabase.storage.from('avatars').upload(yol, dosya, { upsert: true })
    if (yukleme.error) { setKayitDurum('Hata: ' + yukleme.error.message); return }
    const pub = supabase.storage.from('avatars').getPublicUrl(yol)
    const url = pub.data.publicUrl
    const { error } = await supabase.from('profiles').update({ foto_url: url }).eq('id', profil.id)
    setKayitDurum(error ? 'Hata: ' + error.message : 'Fotoğraf güncellendi ✅')
    yukle()
  }

  async function bilgiKaydet() {
    if (!profil) return
    if (!adSoyad.trim()) { setKayitDurum('Ad soyad boş olamaz.'); return }
    if (!kullaniciAdi.trim()) { setKayitDurum('Kullanıcı adı boş olamaz.'); return }
    setKayitDurum('Kaydediliyor...')
    const { error } = await supabase.from('profiles').update({
      ad_soyad: adSoyad.trim(),
      kullanici_adi: kullaniciAdi.trim(),
      cinsiyet,
    }).eq('id', profil.id)
    if (error) {
      const dup = error.code === '23505' || (error.message || '').toLowerCase().includes('duplicate')
      setKayitDurum(dup ? 'Bu kullanıcı adı başkası tarafından alınmış.' : 'Hata: ' + error.message)
      return
    }
    setKayitDurum('Bilgiler kaydedildi ✅')
    yukle()
  }

  async function cikisYap() {
    await supabase.auth.signOut()
    navigate('/giris')
  }

  if (!hazir) return <p className="sayfa">Yükleniyor...</p>
  if (!profil) return (
    <div className="sayfa">
      <p>Profili görmek için giriş yapmalısın.</p>
      <button onClick={() => navigate('/giris')}>Giriş Yap</button>
    </div>
  )

  const avatarBosStil = {
    background: cinsiyetRenk[cinsiyet] || '#6b7280',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  const avatarBosFull = Object.assign({}, avatarImg, avatarBosStil)

  return (
    <div className="sayfa">
      <h2>Profil</h2>

      <div className="kart" style={basKart}>
        <div style={avatarSarmal}>
          {profil.foto_url
            ? <img src={profil.foto_url} alt="Profil" style={avatarImg} className="buyutulebilir" />
            : <div style={avatarBosFull}><Ikon ad={cinsiyetIkon(cinsiyet)} boyut={30} /></div>}
          <span style={onlineNokta} />
        </div>
        <div style={basBilgi}>
          <div style={basAd}>{profil.ad_soyad || 'Oyuncu'}</div>
          <div className="ipucu">@{profil.kullanici_adi || 'kullanici_adi'}</div>
        </div>
      </div>

      <MenuSatir ikon="zil" renk="#dc2626" etiket="Bildirimler" to="/bildirimler" />
      <MenuSatir ikon="arkadaslar" renk="#16a34a" etiket="Arkadaşlarım" to="/arkadaslar" />
      <MenuSatir ikon="mesaj" renk="#2563eb" etiket="Mesajlarım" to="/mesajlar" />
      <MenuSatir ikon="soru" renk="#6b7280" etiket="Yardım ve Destek" to="/hakkinda" />

      <div className="kart" style={menuSatirStil} onClick={() => setDuzenleAcik(v => !v)}>
        <div style={menuIkonStil('#0ea5e9')}><Ikon ad="profil" boyut={18} /></div>
        <span style={menuEtiketStil}>Profil Bilgilerini Düzenle</span>
        <span style={okStil}><Ikon ad="oksag" boyut={18} /></span>
      </div>

      {duzenleAcik && (
        <div className="kart">
          <div className="ortala">
            <label className="btn-gibi" style={kameraBtn}>
              <Ikon ad="kamera" boyut={18} /> Galeriden Fotoğraf Seç
              <input type="file" accept="image/*" onChange={fotoSec} />
            </label>
          </div>
          {kayitDurum && <p className="ipucu ortala">{kayitDurum}</p>}
          <label>Ad Soyad</label>
          <input value={adSoyad} onChange={e => setAdSoyad(e.target.value)} placeholder="Adın Soyadın" />
          <label>Kullanıcı Adı</label>
          <input value={kullaniciAdi} onChange={e => setKullaniciAdi(e.target.value)} placeholder="kullanici_adi" />
          <label>Cinsiyet</label>
          <select value={cinsiyet} onChange={e => setCinsiyet(e.target.value)}>
            <option>Kadın</option>
            <option>Erkek</option>
            <option>Belirtmek istemiyorum</option>
          </select>
          <button onClick={bilgiKaydet} style={kaydetButon}>Bilgileri Kaydet</button>
        </div>
      )}

      <button onClick={cikisYap} style={cikisButon}>Çıkış Yap</button>
    </div>
  )
}
