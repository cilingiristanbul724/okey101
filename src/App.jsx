import { BrowserRouter, Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Ikon from './Ikon'
import FotoOnizleme from './FotoOnizleme'
import Bildirim from './Bildirim'
import Onay from './Onay'
import BildirimIzin from './BildirimIzin'
import { useKalpAtisi } from './utils/kalp'
import { useBildirimler } from './utils/useBildirimler'
import { supabase } from './supabaseClient'
import Giris from './sayfalar/Giris'
import MasaListesi from './sayfalar/MasaListesi'
import MasaAc from './sayfalar/MasaAc'
import Lobi from './sayfalar/Lobi'
import Profil from './sayfalar/Profil'
import Bildirimler from './sayfalar/Bildirimler'
import MasaDetay from './sayfalar/MasaDetay'
import Arkadaslar from './sayfalar/Arkadaslar'
import MesajKutusu from './sayfalar/MesajKutusu'
import OzelSohbet from './sayfalar/OzelSohbet'
import UyeProfil from './sayfalar/UyeProfil'
import Sozlesme from './sayfalar/Sozlesme'
import Hakkinda from './sayfalar/Hakkinda'

const girisBtnStil = { background: 'transparent', border: '1px solid rgba(232,185,35,0.55)', color: '#e8b923', padding: '7px 12px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: 'none', whiteSpace: 'nowrap' }
const uyeolBtnStil = { background: 'linear-gradient(180deg, #e8b923, #c99a12)', color: '#2a2200', border: 'none', padding: '7px 12px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }
const girisAksiyonStil = { display: 'flex', alignItems: 'center', gap: 8 }
const misafirGizliSayfalar = ['/sohbet', '/arkadaslar', '/profil']

function useGirisDurumu() {
  const [girisli, setGirisli] = useState(false)
  const [hazir, setHazir] = useState(false)
  useEffect(() => {
    let iptal = false
    supabase.auth.getSession().then(({ data }) => {
      if (iptal) return
      setGirisli(!!(data.session && data.session.user))
      setHazir(true)
    })
    const abone = supabase.auth.onAuthStateChange((_olay, session) => {
      setGirisli(!!(session && session.user))
      setHazir(true)
    })
    return () => { iptal = true; abone.data.subscription.unsubscribe() }
  }, [])
  return { girisli, hazir }
}

function KurulumKontrol() {
  const konum = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    let iptal = false
    async function kontrol() {
      const res = await supabase.auth.getUser()
      const user = res.data.user
      if (!user) return
      const { data } = await supabase.from('profiles').select('kullanici_adi').eq('id', user.id).single()
      if (iptal) return
      const eksik = !data || !data.kullanici_adi
      if (eksik && konum.pathname !== '/profil' && konum.pathname !== '/giris') {
        navigate('/profil')
      }
    }
    kontrol()
    return () => { iptal = true }
  }, [konum.pathname])
  return null
}

function YukariKaydir() {
  const konum = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    if (document.documentElement) document.documentElement.scrollTop = 0
    if (document.body) document.body.scrollTop = 0
    const g = document.querySelector('.govde')
    if (g) g.scrollTop = 0
  }, [konum.pathname])
  return null
}

function GeriBar() {
  const konum = useLocation()
  const navigate = useNavigate()
  const { girisli } = useGirisDurumu()
  if (konum.pathname === '/') return null
  if (!girisli && misafirGizliSayfalar.includes(konum.pathname)) return null
  return (
    <div className="geri-bar">
      <button className="geri-btn" onClick={() => navigate(-1)} aria-label="Geri">
        <Ikon ad="oksol" boyut={18} /> Geri
      </button>
    </div>
  )
}

function UstBar() {
  const navigate = useNavigate()
  const { girisli, hazir } = useGirisDurumu()

  return (
    <header className="ust-bar">
      <Link to="/" className="marka">
        <span className="logo-tas" aria-hidden="true">
          <span className="logo-tas-no">101</span>
          <span className="logo-tas-isik" />
        </span>
        <span className="logo-yazi">
          <span className="logo-ad">RAKİPBUL</span>
          <span className="logo-alt">Okey &amp; 101 · Yüz Yüze</span>
        </span>
      </Link>
      <div className="ust-aksiyon">
        {hazir && !girisli ? (
          <span style={girisAksiyonStil}>
            <button style={girisBtnStil} onClick={() => navigate('/giris', { state: { mod: 'giris' } })}>Giriş</button>
            <button style={uyeolBtnStil} onClick={() => navigate('/giris', { state: { mod: 'kayit' } })}>Üye Ol</button>
          </span>
        ) : (
          <>
            <Link to="/bildirimler" title="Bildirimler"><Ikon ad="zil" boyut={20} /></Link>
            <Link to="/mesajlar" title="Mesaj Kutusu"><Ikon ad="mesaj" boyut={20} /></Link>
          </>
        )}
      </div>
    </header>
  )
}

function AltMenu() {
  const { arkadaslikIstek, masaTalep } = useBildirimler()
  return (
    <nav className="alt-menu">
      <NavLink to="/" end>
        <span className="ikon"><Ikon ad="masalar" boyut={22} />{masaTalep > 0 && <span className="nav-rozet">{masaTalep}</span>}</span><span>Masalar</span>
      </NavLink>
      <NavLink to="/sohbet">
        <span className="ikon"><Ikon ad="mesaj" boyut={22} /></span><span>Sohbet</span>
      </NavLink>
      <NavLink to="/masa-ac" className="alt-ekle">
        <span className="ikon"><Ikon ad="ekle" boyut={26} /></span>
      </NavLink>
      <NavLink to="/arkadaslar">
        <span className="ikon"><Ikon ad="arkadaslar" boyut={22} />{arkadaslikIstek > 0 && <span className="nav-rozet">{arkadaslikIstek}</span>}</span><span>Arkadaşlar</span>
      </NavLink>
      <NavLink to="/profil">
        <span className="ikon"><Ikon ad="profil" boyut={22} /></span><span>Profil</span>
      </NavLink>
    </nav>
  )
}

export default function App() {
  useKalpAtisi()
  return (
    <BrowserRouter basename="/">
      <Bildirim />
      <Onay />
      <BildirimIzin />
      <FotoOnizleme />
      <KurulumKontrol />
      <YukariKaydir />
      <UstBar />

      <main className="govde">
        <GeriBar />
        <Routes>
          <Route path="/" element={<MasaListesi />} />
          <Route path="/masa-ac" element={<MasaAc />} />
          <Route path="/masa/:id" element={<MasaDetay />} />
          <Route path="/sohbet" element={<Lobi />} />
          <Route path="/arkadaslar" element={<Arkadaslar />} />
          <Route path="/mesajlar" element={<MesajKutusu />} />
          <Route path="/bildirimler" element={<Bildirimler />} />
          <Route path="/ozel/:digerId" element={<OzelSohbet />} />
          <Route path="/uye/:id" element={<UyeProfil />} />
          <Route path="/sozlesme" element={<Sozlesme />} />
          <Route path="/hakkinda" element={<Hakkinda />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/giris" element={<Giris />} />
        </Routes>

        <footer className="alt-bilgi">
          <span className="alt-slogan"><b className="alt-marka">101 RakipBul</b> — gerçek hayatta okey &amp; 101 buluşma platformu</span>
          <Link to="/hakkinda">Nasıl çalışır?</Link>
          <Link to="/sozlesme">Kullanım Şartları &amp; KVKK</Link>
        </footer>
      </main>

      <AltMenu />
    </BrowserRouter>
  )
}
