import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Ikon from '../Ikon'
import SifreInput from '../SifreInput'
import { cevrimiciMi } from '../Durum'

const SORULAR = [
  'İlk evcil hayvanının adı?',
  'Doğduğun şehir?',
  'İlkokul öğretmeninin soyadı?',
  'En sevdiğin takım?',
  'Annenin kızlık soyadı?',
]

const ILETISIM_MAIL = 'mailto:bombilla3434@gmail.com?subject=101%20RakipBul%20Destek%20Talebi'

const cikisButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)', marginTop: 8 }
const kaydetButon = { background: 'linear-gradient(180deg, #16a34a, #15803d)' }
const islemButon = { background: '#0ea5e9', marginTop: 8 }
const islemButonGri = { background: '#6b7280', marginTop: 8 }
const iletisimBtn = { display: 'block', textAlign: 'center', background: 'linear-gradient(180deg, #e8b923, #c99a12)', color: '#2a2200', padding: '12px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, marginTop: 8 }
const guvenlikBaslik = { marginTop: 18, marginBottom: 4 }
const kameraBtn = { display: 'inline-flex', alignItems: 'center', gap: '8px' }

const basKart = { display: 'flex', alignItems: 'center', gap: 18, padding: 18 }
const avatarImg = { width: 128, height: 128, borderRadius: '50%', objectFit: 'cover' }
const onlineNokta = { position: 'absolute', right: 4, bottom: 6, width: 22, height: 22, borderRadius: '50%', border: '3px solid #0b2e23' }
const menuSatirStil = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', marginBottom: 8 }
const menuEtiketStil = { flex: 1, fontWeight: 600 }
const okStil = { opacity: 0.5 }
const avatarSarmal = { position: 'relative', flexShrink: 0 }
const basBilgi = { minWidth: 0 }
const basAd = { fontWeight: 800, fontSize: 26, lineHeight: 1.2 }
const basKullanici = { fontSize: 17, color: '#9fb8ab', marginTop: 6, fontWeight: 600 }
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
  const [acikIslem, setAcikIslem] = useState('')
  const [islemDurum, setIslemDurum] = useState('')
  const [yeniSifre, setYeniSifre] = useState('')
  const [yeniSifre2, setYeniSifre2] = useState('')
  const [yeniSoru, setYeniSoru] = useState(SORULAR[0])
  const [yeniCevap, setYeniCevap] = useState('')
  const navigate = useNavigate()
  const loc = useLocation()

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
  useEffect(() => { if (loc.state && loc.state.duzenle) setDuzenleAcik(true) }, [loc.state])
  useEffect(() => {
    if (hazir && !profil) {
      window.dispatchEvent(new CustomEvent('okey-bildir', { detail: { mesaj: 'Önce giriş yapmalısın!', tip: 'bilgi' } }))
      navigate('/giris', { replace: true })
    }
  }, [hazir, profil])

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

  async function sifreDegistir() {
    if (!yeniSifre || yeniSifre.length < 6) { setIslemDurum('Yeni şifre en az 6 karakter olmalı.'); return }
    if (yeniSifre !== yeniSifre2) { setIslemDurum('Şifreler eşleşmiyor.'); return }
    setIslemDurum('Şifre güncelleniyor...')
    const { error } = await supabase.auth.updateUser({ password: yeniSifre })
    if (error) { setIslemDurum('Hata: ' + error.message); return }
    setIslemDurum('Şifren güncellendi ✅')
    setYeniSifre(''); setYeniSifre2('')
  }

  async function gizliSoruKaydet() {
    if (!yeniCevap.trim()) { setIslemDurum('Cevap boş olamaz.'); return }
    setIslemDurum('Güvenlik sorusu kaydediliyor...')
    const { error } = await supabase.rpc('guvenlik_kaydet', { p_soru: yeniSoru, p_cevap: yeniCevap.trim() })
    if (error) { setIslemDurum('Hata: ' + error.message); return }
    setIslemDurum('Güvenlik sorun güncellendi ✅')
    setYeniCevap('')
  }

  function sifremiUnuttum() {
    navigate('/giris', { state: { mod: 'sifirla', kullaniciAdi: (profil && profil.kullanici_adi) || '' } })
  }

  async function cikisYap() {
    await supabase.auth.signOut()
    navigate('/giris')
  }

  if (!hazir) return <p className="sayfa">Yükleniyor...</p>
  if (!profil) return null

  const avatarBosStil = {
    background: cinsiyetRenk[cinsiyet] || '#6b7280',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  const avatarBosFull = Object.assign({}, avatarImg, avatarBosStil)
  const online = cevrimiciMi(profil.son_gorulme)
  const onlineNoktaFull = Object.assign({}, onlineNokta, { background: online ? '#22c55e' : '#6b7280' })

  return (
    <div className="sayfa">
      <h2 className="profil-bas">PROFİLİM</h2>

      <div className="kart" style={basKart}>
        <div style={avatarSarmal}>
          {profil.foto_url
            ? <img src={profil.foto_url} alt="Profil" style={avatarImg} className="buyutulebilir" />
            : <div style={avatarBosFull}><Ikon ad={cinsiyetIkon(cinsiyet)} boyut={56} /></div>}
          <span style={onlineNoktaFull} title={online ? 'çevrimiçi' : 'çevrimdışı'} />
        </div>
        <div style={basBilgi}>
          <div style={basAd}>{profil.ad_soyad || 'Oyuncu'}</div>
          <div style={basKullanici}>@{profil.kullanici_adi || 'kullanici_adi'}</div>
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
        <>
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

          <div className="kart">
            <h3 style={guvenlikBaslik}>Hesap ve Güvenlik</h3>

            <button onClick={() => { setAcikIslem(acikIslem === 'sifre' ? '' : 'sifre'); setIslemDurum('') }} style={islemButon}>Şifremi Değiştir</button>
            {acikIslem === 'sifre' && (
              <div className="kart">
                <label>Yeni Şifre</label>
                <SifreInput value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} placeholder="En az 6 karakter" />
                <label>Yeni Şifre (Tekrar)</label>
                <SifreInput value={yeniSifre2} onChange={e => setYeniSifre2(e.target.value)} placeholder="Yeni şifreyi tekrar yaz" />
                <button onClick={sifreDegistir} style={kaydetButon}>Şifreyi Güncelle</button>
              </div>
            )}

            <button onClick={sifremiUnuttum} style={islemButonGri}>Şifremi Unuttum</button>

            <button onClick={() => { setAcikIslem(acikIslem === 'gizli' ? '' : 'gizli'); setIslemDurum('') }} style={islemButon}>Gizli Sorumu Değiştir</button>
            {acikIslem === 'gizli' && (
              <div className="kart">
                <label>Güvenlik Sorusu</label>
                <select value={yeniSoru} onChange={e => setYeniSoru(e.target.value)}>
                  {SORULAR.map(s => <option key={s}>{s}</option>)}
                </select>
                <label>Cevabın</label>
                <input value={yeniCevap} onChange={e => setYeniCevap(e.target.value)} placeholder="Yeni cevabını yaz" />
                <button onClick={gizliSoruKaydet} style={kaydetButon}>Güvenlik Sorusunu Kaydet</button>
              </div>
            )}

            <a href={ILETISIM_MAIL} style={iletisimBtn}>Yetkili ile İletişime Geç</a>

            {islemDurum && <p className="ipucu ortala">{islemDurum}</p>}
          </div>
        </>
      )}

      <button onClick={cikisYap} style={cikisButon}>Çıkış Yap</button>
    </div>
  )
}
