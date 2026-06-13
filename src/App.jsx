import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Giris from './sayfalar/Giris'
import MasaListesi from './sayfalar/MasaListesi'
import MasaAc from './sayfalar/MasaAc'
import Harita from './sayfalar/Harita'
import Profil from './sayfalar/Profil'
import AdminPanel from './sayfalar/AdminPanel'
import MekanKayit from './sayfalar/MekanKayit'
import MasaDetay from './sayfalar/MasaDetay'
import Liderlik from './sayfalar/Liderlik'

export default function App() {
  return (
    <BrowserRouter basename="/okey101">
      <nav className="nav">
        <Link to="/">Masalar</Link>
        <Link to="/masa-ac">Masa Aç</Link>
        <Link to="/harita">Harita</Link>
        <Link to="/liderlik">Liderlik</Link>
        <Link to="/mekan-kayit">Mekan Kayıt</Link>
        <Link to="/profil">Profil</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/giris">Giriş</Link>
      </nav>
      <Routes>
        <Route path="/" element={<MasaListesi />} />
        <Route path="/masa-ac" element={<MasaAc />} />
        <Route path="/masa/:id" element={<MasaDetay />} />
        <Route path="/harita" element={<Harita />} />
        <Route path="/liderlik" element={<Liderlik />} />
        <Route path="/mekan-kayit" element={<MekanKayit />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/giris" element={<Giris />} />
      </Routes>
    </BrowserRouter>
  )
}