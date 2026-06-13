import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { anadoluYakasindaMi } from '../utils/konum'

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
        <Marker key={m.id} position={[m.enlem, m.boylam]}>
          <Popup>
            <b>{m.mekan_adi}</b><br />{m.adres}<br />
            <a href={'/okey101/masa/' + m.id}>Masaya git</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
