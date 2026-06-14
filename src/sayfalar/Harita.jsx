import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { anadoluYakasindaMi } from '../utils/konum'

const pinIkon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const haritaStil = { height: '70vh' }
const tileUrl = 'https://' + '{s}.tile.' + 'openstreetmap' + '.org' + '/{z}/{x}/{y}.png'

export default function Harita() {
  const [masalar, setMasalar] = useState([])
  useEffect(() => {
    supabase.from('masalar').select('*').eq('durum', 'Acik')
      .then(({ data }) => setMasalar((data || []).filter(m => anadoluYakasindaMi(m.enlem, m.boylam))))
  }, [])

  return (
    <MapContainer center={[40.99, 29.12]} zoom={12} style={haritaStil}>
      <TileLayer url={tileUrl} />
      {masalar.map(m => (
        <Marker key={m.id} position={[m.enlem, m.boylam]} icon={pinIkon}>
          <Popup>
            <b>{m.baslik || m.mekan_adi}</b><br />{m.adres}<br />
            <a href={'/okey101/masa/' + m.id}>Masaya git</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
