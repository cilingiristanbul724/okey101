import { BrowserRouter, Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Ikon from './Ikon'
import FotoOnizleme from './FotoOnizleme'
import { useKalpAtisi } from './utils/kalp'
import { useBildirimler } from './utils/useBildirimler'
import { supabase } from './supabaseClient'
import Giris from './sayfalar/Giris'
import MasaListesi from './sayfalar/MasaListesi'
import MasaAc from './sayfalar/MasaAc'
import Lobi from './sayfalar/Lobi'
import Profil from './sayfalar/Profil'
import MasaDetay from './sayfalar/MasaDetay'
import Arkadaslar from './sayfalar/Arkadaslar'
import MesajKutusu from './sayfalar/MesajKutusu'
import OzelSohbet from './sayfalar/OzelSohbet'
import UyeProfil from './sayfalar/UyeProfil'
import Sozlesme from './sayfalar/Sozlesme'

// Giris yapmis ama profilini (kullanici adi) tamamlamamis kullaniciyi profile yonlendirir
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
    <BrowserRouter basename="/okey101">
      <FotoOnizleme />
      <KurulumKontrol />
      <header className="ust-bar">
        <Link to="/" className="marka">
          <span className="okey-taslar sol" aria-hidden="true">
            <span className="okey-tas tas-kirmizi">7</span>
            <span className="okey-tas tas-siyah tas-ek">3</span>
          </span>
          <span className="marka-101">101</span>
          <span className="marka-ad">rakipbul</span>
          <span className="okey-taslar sag" aria-hidden="true">
            <span className="okey-tas tas-mavi">9</span>
            <span className="okey-tas tas-sari tas-ek">1</span>
          </span>
        </Link>
        <div className="ust-aksiyon">
          <Link to="/mesajlar" title="Mesaj Kutusu"><Ikon ad="mesaj" boyut={20} /></Link>
          <Link to="/giris" title="Giriş"><Ikon ad="giris" boyut={20} /></Link>
        </div>
      </header>

      <main className="govde">
        <Routes>
          <Route path="/" element={<MasaListesi />} />
          <Route path="/masa-ac" element={<MasaAc />} />
          <Route path="/masa/:id" element={<MasaDetay />} />
          <Route path="/sohbet" element={<Lobi />} />
          <Route path="/arkadaslar" element={<Arkadaslar />} />
          <Route path="/mesajlar" element={<MesajKutusu />} />
          <Route path="/ozel/:digerId" element={<OzelSohbet />} />
          <Route path="/uye/:id" element={<UyeProfil />} />
          <Route path="/sozlesme" element={<Sozlesme />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/giris" element={<Giris />} />
        </Routes>
      </main>

      <AltMenu />
    </BrowserRouter>
  )
}
