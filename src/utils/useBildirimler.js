import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// Arkadaslik istekleri + kendi masalarima gelen katilim talepleri sayisi
export function useBildirimler() {
  const [arkadaslikIstek, setArkadaslikIstek] = useState(0)
  const [masaTalep, setMasaTalep] = useState(0)

  useEffect(() => {
    let aktif = true
    async function say() {
      const res = await supabase.auth.getUser()
      const uid = res.data.user ? res.data.user.id : null
      if (!uid) { if (aktif) { setArkadaslikIstek(0); setMasaTalep(0) } return }

      const { count: ai } = await supabase.from('arkadaslar')
        .select('id', { count: 'exact', head: true })
        .eq('istenen_id', uid).eq('durum', 'Beklemede')

      let mt = 0
      const { data: masalarim } = await supabase.from('masalar').select('id').eq('acan_id', uid)
      const idler = (masalarim || []).map(m => m.id)
      if (idler.length) {
        const { count } = await supabase.from('masa_oyunculari')
          .select('id', { count: 'exact', head: true })
          .in('masa_id', idler).eq('katilim_durumu', 'Talep')
        mt = count || 0
      }

      if (aktif) { setArkadaslikIstek(ai || 0); setMasaTalep(mt) }
    }
    say()
    const z = setInterval(say, 20000)
    return () => { aktif = false; clearInterval(z) }
  }, [])

  return { arkadaslikIstek, masaTalep }
}
