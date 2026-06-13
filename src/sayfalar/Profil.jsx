import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const cikisButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)' }

export default function Profil() {
  const [profil, setProfil] = useState(null)
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

  async function cinsiyetKaydet(deger) {
    await supabase.from('profiles').update({ cinsiyet: deger }).eq('id', profil.id)
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

  const basharf = (profil.ad_soyad || profil.kullanici_adi || '?').charAt(0).toUpperCase()

  return (
    <div className="sayfa">
      <h2>Profil</h2>

      <div className="profil-foto-alani">
        {profil.foto_url
          ? <img className="profil-foto" src={profil.foto_url} alt="Profil" />
          : <div className="profil-foto profil-foto-bos">{basharf}</div>}
      </div>

      <div className="ortala">
        <label className="btn-gibi">
          📷 Galeriden Fotoğraf Seç
          <input type="file" accept="image/*" onChange={fotoSec} />
        </label>
      </div>
      {kayitDurum && <p className="ipucu ortala">{kayitDurum}</p>}

      <div className="kart">
        <p><b>Ad Soyad:</b> {profil.ad_soyad || '—'}</p>
        <p><b>Kullanıcı Adı:</b> {profil.kullanici_adi || '—'}</p>
        <label>Cinsiyet</label>
        <select value={profil.cinsiyet || 'Belirtmek istemiyorum'} onChange={e => cinsiyetKaydet(e.target.value)}>
          <option>Kadın</option>
          <option>Erkek</option>
          <option>Belirtmek istemiyorum</option>
        </select>
      </div>

      <button onClick={cikisYap} style={cikisButon}>Çıkış Yap</button>
    </div>
  )
}
