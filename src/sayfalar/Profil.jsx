import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const cikisButon = { background: '#dc2626' }

export default function Profil() {
  const [profil, setProfil] = useState(null)
  const [fotoUrl, setFotoUrl] = useState('')
  const [kayitDurum, setKayitDurum] = useState('')
  const [hazir, setHazir] = useState(false)
  const navigate = useNavigate()

  async function yukle() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) { setProfil(null); setHazir(true); return }

    await supabase.from('profiles').upsert(
      { id: user.id }, { onConflict: 'id', ignoreDuplicates: true }
    )
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfil(data)
    setFotoUrl(data?.foto_url || '')
    setHazir(true)
  }
  useEffect(() => { yukle() }, [])

  async function fotoKaydet() {
    setKayitDurum('Kaydediliyor...')
    const { error } = await supabase.from('profiles').update({ foto_url: fotoUrl || null }).eq('id', profil.id)
    setKayitDurum(error ? 'Hata: ' + error.message : 'Kaydedildi ✅')
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
      <h2>Profil Bilgileri</h2>

      <div className="profil-foto-alani">
        {profil.foto_url
          ? <img className="profil-foto" src={profil.foto_url} alt="Profil" />
          : <div className="profil-foto profil-foto-bos">{basharf}</div>}
      </div>

      <div className="kart">
        <p><b>Ad Soyad:</b> {profil.ad_soyad || '—'}</p>
        <p><b>Kullanıcı Adı:</b> {profil.kullanici_adi || '—'}</p>
        <p><b>Cinsiyet:</b> {profil.cinsiyet || '—'}</p>
      </div>

      <label>Profil Fotoğrafı (opsiyonel — fotoğraf bağlantısı)</label>
      <input value={fotoUrl} onChange={e => setFotoUrl(e.target.value)} placeholder="https://... (istersen ekle)" />
      <button onClick={fotoKaydet}>Fotoğrafı Kaydet</button>
      {kayitDurum && <p>{kayitDurum}</p>}

      <hr />
      <button onClick={cikisYap} style={cikisButon}>Çıkış Yap</button>
    </div>
  )
}
