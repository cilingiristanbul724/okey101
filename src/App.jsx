import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
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
      <nav className="nav">
        <Link to="/">Masalar</Link>
        <Link to="/masa-ac">Masa Aç</Link>
        <Link to="/harita">Harita</Link>
        <Link to="/arkadaslar">Arkadaşlar</Link>
        <Link to="/mesajlar">Mesaj Kutusu</Link>
        <Link to="/profil">Profil</Link>
        <Link to="/giris">Giriş</Link>
      </nav>
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
    </BrowserRouter>
  )
}
