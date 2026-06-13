import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Chat({ masaId }) {
  const [mesajlar, setMesajlar] = useState([])
  const [metin, setMetin] = useState('')

  useEffect(() => {
    supabase.from('mesajlar').select('*')
      .eq('masa_id', masaId).order('created_at')
      .then(({ data }) => setMesajlar(data || []))

    const kanal = supabase.channel('mesajlar-' + masaId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mesajlar', filter: 'masa_id=eq.' + masaId },
        payload => setMesajlar(eski => [...eski, payload.new])
      )
      .subscribe()

    return () => { supabase.removeChannel(kanal) }
  }, [masaId])

  async function gonder() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user || !metin.trim()) return
    await supabase.from('mesajlar').insert({
      masa_id: masaId, gonderen_id: user.id, icerik: metin,
    })
    setMetin('')
  }

  return (
    <div className="sayfa">
      <h3>Masa Sohbeti</h3>
      <div className="kart">
        {mesajlar.map(m => <p key={m.id}>{m.icerik}</p>)}
      </div>
      <input value={metin} onChange={e => setMetin(e.target.value)} placeholder="Mesaj yaz..." />
      <button onClick={gonder}>Gönder</button>
    </div>
  )
}