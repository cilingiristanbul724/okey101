import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const SORULAR = [
  'İlk evcil hayvanının adı?',
  'Doğduğun şehir?',
  'İlkokul öğretmeninin soyadı?',
  'En sevdiğin takım?',
  'Annenin kızlık soyadı?',
]

function kullaniciEpostasi(kullaniciAdi) {
  return kullaniciAdi.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '') + '@okey101.local'
}

function hatirlaKaydet(beniHatirla) {
  localStorage.setItem('okey101-hatirla', beniHatirla ? 'true' : 'false')
  sessionStorage.setItem('okey101-oturum-aktif', '1')
}

export default function Giris() {
  const [mod, setMod] = useState('giris')
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [adSoyad, setAdSoyad] = useState('')
  const [cinsiyet, setCinsiyet] = useState('Belirtmek istemiyorum')
  const [sifre, setSifre] = useState('')
  const [beniHatirla, setBeniHatirla] = useState(true)
  const [sozlesmeOnay, setSozlesmeOnay] = useState(false)
  const [guvenlikSoru, setGuvenlikSoru] = useState(SORULAR[0])
  const [guvenlikCevap, setGuvenlikCevap] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  const [sifirlaAsama, setSifirlaAsama] = useState(1)
  const [sifirlaSoru, setSifirlaSoru] = useState('')
  const [sifirlaCevap, setSifirlaCevap] = useState('')
  const [yeniSifre, setYeniSifre] = useState('')

  const navigate = useNavigate()

  async function kayitOl() {
    if (!kullaniciAdi.trim() || !sifre || !adSoyad.trim())
      return alert('Ad soyad, kullanıcı adı ve şifre zorunlu.')
    if (!guvenlikCevap.trim())
      return alert('Güvenlik sorusu cevabı zorunlu (şifreni unutursan kurtarman için).')
    if (!sozlesmeOnay)
      return alert('Devam etmek için 18 yaş üstü olduğunu ve Kullanım Şartları / KVKK metnini onaylamalısın.')
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
        kvkk_onay: true,
      }, { onConflict: 'id' })
    }
    await supabase.auth.signInWithPassword({ email: eposta, password: sifre })
    await supabase.rpc('guvenlik_kaydet', { p_soru: guvenlikSoru, p_cevap: guvenlikCevap.trim() })
    hatirlaKaydet(beniHatirla)
    setYukleniyor(false)
    alert('Kayıt başarılı! Hoş geldin.')
    navigate('/profil')
  }

  async function girisYap() {
    if (!kullaniciAdi.trim() || !sifre) return alert('Kullanıcı adı ve şifre gerekli.')
    setYukleniyor(true)
    const eposta = kullaniciEpostasi(kullaniciAdi)
    const { error } = await supabase.auth.signInWithPassword({ email: eposta, password: sifre })
    if (error) { setYukleniyor(false); return alert('Giriş başarısız: ' + error.message) }
    hatirlaKaydet(beniHatirla)
    setYukleniyor(false)
    alert('Giriş başarılı!')
    navigate('/')
  }

  async function soruyuGetir() {
    if (!kullaniciAdi.trim()) return alert('Önce kullanıcı adını yaz.')
    setYukleniyor(true)
    const { data, error } = await supabase.rpc('guvenlik_soru_getir', { p_kullanici_adi: kullaniciAdi.trim() })
    setYukleniyor(false)
    if (error) return alert('Bir hata oldu: ' + error.message)
    if (!data) return alert('Bu kullanıcı adına ait bir güvenlik sorusu bulunamadı.')
    setSifirlaSoru(data)
    setSifirlaAsama(2)
  }

  async function sifreyiSifirla() {
    if (!sifirlaCevap.trim() || !yeniSifre) return alert('Cevap ve yeni şifre gerekli.')
    if (yeniSifre.length < 6) return alert('Yeni şifre en az 6 karakter olmalı.')
    setYukleniyor(true)
    const { data, error } = await supabase.rpc('sifre_sifirla', {
      p_kullanici_adi: kullaniciAdi.trim(),
      p_cevap: sifirlaCevap.trim(),
      p_yeni_sifre: yeniSifre,
    })
    setYukleniyor(false)
    if (error) return alert('Bir hata oldu: ' + error.message)
    if (data === 'CEVAP_YANLIS') return alert('Cevap yanlış. Tekrar dene.')
    if (data === 'KULLANICI_YOK') return alert('Kullanıcı bulunamadı.')
    if (data === 'SORU_YOK') return alert('Bu hesapta güvenlik sorusu tanımlı değil.')
    if (data === 'SIFRE_KISA') return alert('Yeni şifre en az 6 karakter olmalı.')
    if (data === 'TAMAM') {
      alert('Şifren güncellendi! Yeni şifrenle giriş yapabilirsin.')
      setSifre(yeniSifre)
      setMod('giris')
      setSifirlaAsama(1)
      setSifirlaCevap('')
      setYeniSifre('')
    } else {
      alert('Beklenmeyen sonuç: ' + data)
    }
  }

  const ikincilButon = { background: '#6b7280' }
  const baglantiButon = { background: 'transparent', boxShadow: 'none', color: 'var(--altin)', textDecoration: 'underline', padding: '6px 0', fontWeight: 600, fontSize: '14px' }
  const hatirlaSatir = { display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0 4px', fontSize: '14px', color: 'var(--metin)', cursor: 'pointer', fontWeight: 600 }
  const sozlesmeSatir = { display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '12px 0 4px', fontSize: '13px', color: 'var(--metin)', cursor: 'pointer', lineHeight: 1.4 }
  const onayKutu = { width: '18px', height: '18px', minWidth: '18px', margin: 0, padding: 0, accentColor: 'var(--altin)', background: 'transparent', border: 'none' }
  const soruStil = { fontWeight: 700, color: 'var(--altin)' }

  if (mod === 'sifirla') {
    return (
      <div className="sayfa">
        <h2>Şifremi Unuttum</h2>
        {sifirlaAsama === 1 ? (
          <>
            <p className="ipucu">Kullanıcı adını yaz, güvenlik sorunu getirelim.</p>
            <label>Kullanıcı Adı</label>
            <input value={kullaniciAdi} onChange={e => setKullaniciAdi(e.target.value)} placeholder="kullanici_adi" />
            <button onClick={soruyuGetir} disabled={yukleniyor}>Soruyu Getir</button>
            <button onClick={() => setMod('giris')} style={ikincilButon}>Vazgeç</button>
          </>
        ) : (
          <>
            <label>Güvenlik Sorusu</label>
            <p style={soruStil}>{sifirlaSoru}</p>
            <label>Cevabın</label>
            <input value={sifirlaCevap} onChange={e => setSifirlaCevap(e.target.value)} placeholder="Cevabını yaz" />
            <label>Yeni Şifre</label>
            <input type="password" value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} placeholder="En az 6 karakter" />
            <button onClick={sifreyiSifirla} disabled={yukleniyor}>Şifreyi Sıfırla</button>
            <button onClick={() => { setSifirlaAsama(1); setSifirlaCevap(''); setYeniSifre('') }} style={ikincilButon}>Geri</button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="sayfa">
      <div className="giris-tanitim">
        <p>🀄 <b>101 RakipBul</b> — yakınındaki oyuncularla <b>yüz yüze</b> okey ve 101 oynamak için buluş. Çevrimiçi oyun değil, gerçek masa!</p>
        <Link to="/hakkinda">Nasıl çalışır?</Link>
      </div>

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

      {mod === 'kayit' && (
        <>
          <label>Güvenlik Sorusu</label>
          <select value={guvenlikSoru} onChange={e => setGuvenlikSoru(e.target.value)}>
            {SORULAR.map(s => <option key={s}>{s}</option>)}
          </select>
          <label>Güvenlik Cevabı</label>
          <input value={guvenlikCevap} onChange={e => setGuvenlikCevap(e.target.value)} placeholder="Şifreni unutursan bununla kurtarırsın" />
        </>
      )}

      <label style={hatirlaSatir}>
        <input type="checkbox" style={onayKutu} checked={beniHatirla} onChange={e => setBeniHatirla(e.target.checked)} />
        Beni hatırla
      </label>

      {mod === 'kayit' && (
        <label style={sozlesmeSatir}>
          <input type="checkbox" style={onayKutu} checked={sozlesmeOnay} onChange={e => setSozlesmeOnay(e.target.checked)} />
          <span>18 yaşından büyüğüm; <Link to="/sozlesme">Kullanım Şartları ve KVKK</Link> metnini okudum, kabul ediyorum.</span>
        </label>
      )}

      {mod === 'giris' ? (
        <>
          <button onClick={girisYap} disabled={yukleniyor}>Giriş Yap</button>
          <button onClick={() => setMod('kayit')} style={ikincilButon}>Hesabın yok mu? Kayıt Ol</button>
          <div><button onClick={() => { setMod('sifirla'); setSifirlaAsama(1) }} style={baglantiButon}>Şifremi unuttum</button></div>
        </>
      ) : (
        <>
          <button onClick={kayitOl} disabled={yukleniyor}>Kayıt Ol</button>
          <button onClick={() => setMod('giris')} style={ikincilButon}>Zaten üye misin? Giriş Yap</button>
        </>
      )}
    </div>
  )
}
