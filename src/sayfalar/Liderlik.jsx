import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Liderlik() {
  const [oyuncular, setOyuncular] = useState([])
  useEffect(() => {
    supabase.from('profiles').select('ad, puan, seviye, guven_sertifikasi')
      .order('puan', { ascending: false }).limit(20)
      .then(({ data }) => setOyuncular(data || []))
  }, [])

  return (
    <div className="sayfa">
      <h2>Liderlik Tablosu</h2>
      <ol>
        {oyuncular.map((o, i) => (
          <li key={i}>
            {o.ad} — {o.puan} puan (Sv {o.seviye}) {o.guven_sertifikasi ? '✅' : ''}
          </li>
        ))}
      </ol>
    </div>
  )
}