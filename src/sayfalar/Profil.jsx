import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Ikon from '../Ikon'

const cikisButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)' }
const kaydetButon = { background: 'linear-gradient(180deg, #16a34a, #15803d)' }
const kameraBtn = { display: 'inline-flex', alignItems: 'center', gap: '8px' }

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

export default function Profil() {
  const [profil, setProfil] = useState(null)
  const [adSoyad, setAdSoyad] = useState('')
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [cinsiyet, setCinsiyet] = useState('Belirtmek istemiyorum')
  const [kayitDurum, setKayitDurum] = useState('')
  const [hazir, setHazir] = useState(false)
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

  return (
    <div className="sayfa">
      <h2>Profil</h2>

      <div className="profil-foto-alani">
        {profil.foto_url
          ? <img className="profil-foto" src={profil.foto_url} alt="Profil" />
          : <div className="profil-foto profil-foto-bos" style={avatarBosStil}>
              <Ikon ad={cinsiyetIkon(cinsiyet)} boyut={56} />
            </div>}
      </div>

      <div className="ortala">
        <label className="btn-gibi" style={kameraBtn}>
          <Ikon ad="kamera" boyut={18} /> Galeriden Fotoğraf Seç
          <input type="file" accept="image/*" onChange={fotoSec} />
        </label>
      </div>
      {kayitDurum && <p className="ipucu ortala">{kayitDurum}</p>}

      <div className="kart">
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

      <button onClick={cikisYap} style={cikisButon}>Çıkış Yap</button>
    </div>
  )
}
