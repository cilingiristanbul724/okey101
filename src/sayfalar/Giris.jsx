import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Ikon from '../Ikon'
import SifreInput from '../SifreInput'

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
  const loc = useLocation()
  const baslangicMod = (loc.state && loc.state.mod) ? loc.state.mod : 'giris'
  const baslangicKullanici = (loc.state && loc.state.kullaniciAdi) ? loc.state.kullaniciAdi : ''
  const [mod, setMod] = useState(baslangicMod)
  const [kullaniciAdi, setKullaniciAdi] = useState(baslangicKullanici)
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
    if (sifre.length < 6)
      return alert('Şifre en az 6 karakter olmalı.')
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
  const butonSatir = { display: 'flex', gap: 10, marginTop: 10 }
  const satirBtn = { flex: 1, margin: 0 }
  const hatirlaSatir = { display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0 4px', fontSize: '14px', color: 'var(--metin)', cursor: 'pointer', fontWeight: 600 }
  const sozlesmeSatir = { display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '12px 0 4px', fontSize: '13px', color: 'var(--metin)', cursor: 'pointer', lineHeight: 1.4 }
  const onayKutu = { width: '18px', height: '18px', minWidth: '18px', margin: 0, padding: 0, accentColor: 'var(--altin)', background: 'transparent', border: 'none' }
  const soruStil = { fontWeight: 700, color: 'var(--altin)' }

  const heroSar = { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '6px 0 22px' }
  const heroTas = { width: 80, height: 80, borderRadius: 20 }
  const heroTasNo = { fontSize: 33 }
  const heroWordmark = { fontSize: 31, fontWeight: 900, letterSpacing: '.3px', marginTop: 14, color: '#ffffff' }
  const heroWordmarkAltin = { color: '#e8b923' }
  const heroSlogan = { margin: '10px auto 0', color: '#cfe3d8', fontSize: '14.5px', lineHeight: 1.5, fontWeight: 600, maxWidth: 300 }
  const inputSar = { position: 'relative', margin: '12px 0' }
  const inputIkon = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#7fae9b', display: 'flex', pointerEvents: 'none' }
  const ikonluInput = { paddingLeft: 42, margin: 0 }
  const anaBtn = { width: '100%', margin: '16px 0 0', padding: '14px', fontSize: 16 }
  const unutBtn = { width: '100%', margin: '10px 0 0', background: 'transparent', boxShadow: 'none', color: '#9fb8ab', textDecoration: 'underline', padding: '8px 0', fontWeight: 600, fontSize: '13px' }
  const gecisSar = { textAlign: 'center', marginTop: 8, color: '#9fb8ab', fontSize: '14px' }
  const gecisBtn = { background: 'transparent', boxShadow: 'none', color: '#e8b923', textDecoration: 'underline', fontWeight: 700, padding: 0, margin: '0 0 0 6px', fontSize: '14px', width: 'auto', display: 'inline' }

  const hero = (
    <div style={heroSar}>
      <div className="logo-tas" style={heroTas}>
        <span className="logo-tas-no" style={heroTasNo}>101</span>
        <span className="logo-tas-isik" />
      </div>
      <div style={heroWordmark}>101<span style={heroWordmarkAltin}>rakipbul</span></div>
      <p style={heroSlogan}>Yakınındaki oyuncularla gerçek bir masada yüz yüze okey ve 101 oyna!</p>
    </div>
  )

  if (mod === 'sifirla') {
    return (
      <div className="sayfa">
        {hero}
        <h2>Şifremi Unuttum</h2>
        {sifirlaAsama === 1 ? (
          <>
            <p className="ipucu">Kullanıcı adını yaz, güvenlik sorunu getirelim.</p>
            <label>Kullanıcı Adı</label>
            <input value={kullaniciAdi} onChange={e => setKullaniciAdi(e.target.value)} placeholder="kullanici_adi" />
            <div style={butonSatir}>
              <button onClick={soruyuGetir} disabled={yukleniyor} style={satirBtn}>Gizli Sorumu Getir</button>
              <button onClick={() => setMod('giris')} style={Object.assign({}, satirBtn, ikincilButon)}>Vazgeç</button>
            </div>
          </>
        ) : (
          <>
            <label>Güvenlik Sorusu</label>
            <p style={soruStil}>{sifirlaSoru}</p>
            <label>Cevabın</label>
            <input value={sifirlaCevap} onChange={e => setSifirlaCevap(e.target.value)} placeholder="Cevabını yaz" />
            <label>Yeni Şifre</label>
            <SifreInput value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} placeholder="En az 6 karakter" />
            <div style={butonSatir}>
              <button onClick={sifreyiSifirla} disabled={yukleniyor} style={satirBtn}>Şifreyi Sıfırla</button>
              <button onClick={() => { setSifirlaAsama(1); setSifirlaCevap(''); setYeniSifre('') }} style={Object.assign({}, satirBtn, ikincilButon)}>Geri</button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="sayfa">
      {hero}

      {mod === 'giris' ? (
        <>
          <div style={inputSar}>
            <span style={inputIkon}><Ikon ad="kullanici" boyut={18} /></span>
            <input style={ikonluInput} value={kullaniciAdi} onChange={e => setKullaniciAdi(e.target.value)} placeholder="Kullanıcı Adı" />
          </div>
          <SifreInput value={sifre} onChange={e => setSifre(e.target.value)} placeholder="Şifreniz" />

          <label style={hatirlaSatir}>
            <input type="checkbox" style={onayKutu} checked={beniHatirla} onChange={e => setBeniHatirla(e.target.checked)} />
            Beni hatırla
          </label>

          <button onClick={girisYap} disabled={yukleniyor} style={anaBtn}>Giriş Yap</button>
          <button onClick={() => { setMod('sifirla'); setSifirlaAsama(1) }} style={unutBtn}>Şifremi unuttum</button>

          <div style={gecisSar}>Hesabınız yok mu?<button onClick={() => setMod('kayit')} style={gecisBtn}>Kayıt Ol</button></div>
        </>
      ) : (
        <>
          <h2>Kayıt Ol</h2>
          <label>Ad Soyad</label>
          <input value={adSoyad} onChange={e => setAdSoyad(e.target.value)} placeholder="Adın Soyadın" />
          <label>Cinsiyet</label>
          <select value={cinsiyet} onChange={e => setCinsiyet(e.target.value)}>
            <option>Kadın</option>
            <option>Erkek</option>
            <option>Belirtmek istemiyorum</option>
          </select>

          <label>Kullanıcı Adı</label>
          <input value={kullaniciAdi} onChange={e => setKullaniciAdi(e.target.value)} placeholder="kullanici_adi" />
          <label>Şifre</label>
          <SifreInput value={sifre} onChange={e => setSifre(e.target.value)} placeholder="En az 6 karakter" />

          <label>Güvenlik Sorusu</label>
          <select value={guvenlikSoru} onChange={e => setGuvenlikSoru(e.target.value)}>
            {SORULAR.map(s => <option key={s}>{s}</option>)}
          </select>
          <label>Güvenlik Cevabı</label>
          <input value={guvenlikCevap} onChange={e => setGuvenlikCevap(e.target.value)} placeholder="Şifreni unutursan bununla kurtarırsın" />

          <label style={hatirlaSatir}>
            <input type="checkbox" style={onayKutu} checked={beniHatirla} onChange={e => setBeniHatirla(e.target.checked)} />
            Beni hatırla
          </label>

          <label style={sozlesmeSatir}>
            <input type="checkbox" style={onayKutu} checked={sozlesmeOnay} onChange={e => setSozlesmeOnay(e.target.checked)} />
            <span>18 yaşından büyüğüm; <Link to="/sozlesme">Kullanım Şartları ve KVKK</Link> metnini okudum, kabul ediyorum.</span>
          </label>

          <button onClick={kayitOl} disabled={yukleniyor} style={anaBtn}>Kayıt Ol</button>
          <div style={gecisSar}>Zaten üye misin?<button onClick={() => setMod('giris')} style={gecisBtn}>Giriş Yap</button></div>
        </>
      )}
    </div>
  )
}
