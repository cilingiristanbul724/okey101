import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import Giris from './sayfalar/Giris'
import MasaListesi from './sayfalar/MasaListesi'
import MasaAc from './sayfalar/MasaAc'
import Harita from './sayfalar/Harita'
import Profil from './sayfalar/Profil'
import MasaDetay from './sayfalar/MasaDetay'
import Arkadaslar from './sayfalar/Arkadaslar'
import MesajKutusu from './sayfalar/MesajKutusu'
import OzelSohbet from './sayfalar/OzelSohbet'

export default function App() {
  return (
    <BrowserRouter basename="/okey101">
      <header className="ust-bar">
        <Link to="/" className="marka">
          <span className="marka-101">101</span>
          <span className="marka-ad">rakipbul</span>
        </Link>
        <div className="ust-aksiyon">
          <Link to="/mesajlar" title="Mesaj Kutusu">💬</Link>
          <Link to="/giris" title="Giriş">🔑</Link>
        </div>
      </header>

      <main className="govde">
        <Routes>
          <Route path="/" element={<MasaListesi />} />
          <Route path="/masa-ac" element={<MasaAc />} />
          <Route path="/masa/:id" element={<MasaDetay />} />
          <Route path="/harita" element={<Harita />} />
          <Route path="/arkadaslar" element={<Arkadaslar />} />
          <Route path="/mesajlar" element={<MesajKutusu />} />
          <Route path="/ozel/:digerId" element={<OzelSohbet />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/giris" element={<Giris />} />
        </Routes>
      </main>

      <nav className="alt-menu">
        <NavLink to="/" end>
          <span className="ikon">🏠</span><span>Masalar</span>
        </NavLink>
        <NavLink to="/harita">
          <span className="ikon">🗺️</span><span>Harita</span>
        </NavLink>
        <NavLink to="/masa-ac" className="alt-ekle">
          <span className="ikon">➕</span>
        </NavLink>
        <NavLink to="/arkadaslar">
          <span className="ikon">👥</span><span>Arkadaşlar</span>
        </NavLink>
        <NavLink to="/profil">
          <span className="ikon">👤</span><span>Profil</span>
        </NavLink>
      </nav>
    </BrowserRouter>
  )
}
