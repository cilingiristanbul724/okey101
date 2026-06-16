import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import Ikon from './Ikon'
import { konumAl, anadoluYakasindaMi } from './utils/konum'

const pinIkon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const tileUrl = 'https://' + '{s}.tile.' + 'openstreetmap' + '.org' + '/{z}/{x}/{y}.png'
const haritaStil = { height: '300px', borderRadius: '14px', marginTop: '8px', overflow: 'hidden' }
const butonStil = { background: 'linear-gradient(180deg, #16a34a, #15803d)', display: 'inline-flex', alignItems: 'center', gap: '8px' }

function Tiklama({ onSec }) {
  useMapEvents({ click(e) { onSec(e.latlng.lat, e.latlng.lng) } })
  return null
}

function Merkez({ enlem, boylam }) {
  const harita = useMap()
  useEffect(() => {
    if (enlem != null && boylam != null) harita.flyTo([enlem, boylam], 16, { duration: 0.8 })
  }, [enlem, boylam])
  return null
}

export default function KonumSecici({ enlem, boylam, onDegis }) {
  const [durum, setDurum] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  async function buradayim() {
    setYukleniyor(true)
    setDurum('Konum alınıyor... (telefonunda izin penceresi çıkabilir)')
    try {
      const k = await konumAl()
      onDegis(k.enlem, k.boylam)
      setDurum(anadoluYakasindaMi(k.enlem, k.boylam)
        ? 'Konumun işaretlendi ✅ Pini sürükleyerek ince ayar yapabilirsin.'
        : '⚠️ Konumun İstanbul Anadolu Yakası dışında görünüyor. Pilot bölge şimdilik sadece Anadolu Yakası.')
    } catch (e) {
      setDurum(e.message)
    }
    setYukleniyor(false)
  }

  useEffect(() => { buradayim() }, [])

  const merkez = (enlem != null && boylam != null) ? [enlem, boylam] : [40.99, 29.12]
  const surukleHandlers = { dragend: (e) => { const p = e.target.getLatLng(); onDegis(p.lat, p.lng) } }

  return (
    <div>
      <div className="sag-aksiyon">
        <button type="button" onClick={buradayim} disabled={yukleniyor} style={butonStil}>
          <Ikon ad="pin" boyut={18} /> {yukleniyor ? 'Konum alınıyor...' : 'Buradayım (konumumu bul)'}
        </button>
      </div>
      {durum && <p className="ipucu">{durum}</p>}
      <MapContainer center={merkez} zoom={enlem != null ? 16 : 12} style={haritaStil} scrollWheelZoom={false}>
        <TileLayer url={tileUrl} />
        <Merkez enlem={enlem} boylam={boylam} />
        <Tiklama onSec={(la, lo) => onDegis(la, lo)} />
        {enlem != null && boylam != null && (
          <Marker position={[enlem, boylam]} draggable icon={pinIkon} eventHandlers={surukleHandlers} />
        )}
      </MapContainer>
      <p className="ipucu">Haritaya dokunarak da konum seçebilir, pini sürükleyerek tam noktayı ayarlayabilirsin.</p>
    </div>
  )
}
