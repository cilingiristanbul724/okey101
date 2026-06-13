import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const haritaStil = { height: '70vh' }
const tileUrl = 'https://' + '{s}.tile.' + 'openstreetmap' + '.org' + '/{z}/{x}/{y}.png'

export default function Harita() {
  const [mekanlar, setMekanlar] = useState([])
  useEffect(() => {
    supabase.from('mekanlar').select('*').eq('durum', 'Onayli')
      .then(({ data }) => setMekanlar(data || []))
  }, [])

  return (
    <MapContainer center={[41.0082, 28.9784]} zoom={12} style={haritaStil}>
      <TileLayer url={tileUrl} />
      {mekanlar.map(m => (
        <Marker key={m.id} position={[m.enlem, m.boylam]}>
          <Popup>
            <b>{m.ad}</b><br />{m.adres}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}