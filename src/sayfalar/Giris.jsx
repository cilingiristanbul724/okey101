import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// Supabase Auth bir e-posta ister; kullanıcı sadece "kullanıcı adı" girsin diye
// arka planda sahte bir e-posta üretiyoruz. Böylece giriş tamamen
// kullanıcı adı + şifre ile, onaysız çalışır.
function kullaniciEpostasi(kullaniciAdi) {
  return kullaniciAdi.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '') + '@okey101.local'
}

export default function Giris() {
  const [mod, setMod] = useState('giris')
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [adSoyad, setAdSoyad] = useState('')
  const [cinsiyet, setCinsiyet] = useState('Belirtmek istemiyorum')
  const [sifre, setSifre] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const navigate = useNavigate()

  async function kayitOl() {
    if (!kullaniciAdi.trim() || !sifre || !adSoyad.trim())
      return alert('Ad soyad, kullanıcı adı ve şifre zorunlu.')
    setYukleniyor(true)
    const eposta = kullaniciEpostasi(kullaniciAdi)
    const { data, error } = await supabase.auth.signUp({ email: eposta, password: sifre })
    if (error) { setYukleniyor(false); return alert(error.message) }

    const user = data.user
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        kullanici_adi: kullaniciAdi.trim(),
        ad_soyad: adSoyad.trim(),
        cinsiyet,
      }, { onConflict: 'id' })
    }
    await supabase.auth.signInWithPassword({ email: eposta, password: sifre })
    setYukleniyor(false)
    alert('Kayıt başarılı! Hoş geldin.')
    navigate('/profil')
  }

  async function girisYap() {
    if (!kullaniciAdi.trim() || !sifre) return alert('Kullanıcı adı ve şifre gerekli.')
    setYukleniyor(true)
    const eposta = kullaniciEpostasi(kullaniciAdi)
    const { error } = await supabase.auth.signInWithPassword({ email: eposta, password: sifre })
    setYukleniyor(false)
    if (error) return alert('Giriş başarısız: ' + error.message)
    alert('Giriş başarılı!')
    navigate('/')
  }

  return (
    <div className="sayfa">
      <h2>{mod === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}</h2>

      {mod === 'kayit' && (
        <>
          <label>Ad Soyad</label>
          <input value={adSoyad} onChange={e => setAdSoyad(e.target.value)} placeholder="Adın Soyadın" />
          <label>Cinsiyet</label>
          <select value={cinsiyet} onChange={e => setCinsiyet(e.target.value)}>
            <option>Kadın</option>
            <option>Erkek</option>
            <option>Belirtmek istemiyorum</option>
          </select>
        </>
      )}

      <label>Kullanıcı Adı</label>
      <input value={kullaniciAdi} onChange={e => setKullaniciAdi(e.target.value)} placeholder="kullanici_adi" />
      <label>Şifre</label>
      <input type="password" value={sifre} onChange={e => setSifre(e.target.value)} placeholder="Şifre" />

      {mod === 'giris' ? (
        <>
          <button onClick={girisYap} disabled={yukleniyor}>Giriş Yap</button>
          <button onClick={() => setMod('kayit')} style= background: '#6b7280' >Hesabın yok mu? Kayıt Ol</button>
        </>
      ) : (
        <>
          <button onClick={kayitOl} disabled={yukleniyor}>Kayıt Ol</button>
          <button onClick={() => setMod('giris')} style= background: '#6b7280' >Zaten üye misin? Giriş Yap</button>
        </>
      )}
    </div>
  )
}
