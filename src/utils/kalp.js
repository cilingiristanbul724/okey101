import { useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Kullanici uygulamadayken her 30 sn'de son_gorulme degerini gunceller.
// Boylece cevrimici/cevrimdisi durumu hesaplanabilir.
export function useKalpAtisi() {
  useEffect(() => {
    let durdu = false
    async function at() {
      const res = await supabase.auth.getUser()
      const uid = res.data.user ? res.data.user.id : null
      if (uid && !durdu) {
        await supabase.from('profiles').update({ son_gorulme: new Date().toISOString() }).eq('id', uid)
      }
    }
    at()
    const z = setInterval(at, 30000)
    const gorunur = () => { if (document.visibilityState === 'visible') at() }
    document.addEventListener('visibilitychange', gorunur)
    return () => { durdu = true; clearInterval(z); document.removeEventListener('visibilitychange', gorunur) }
  }, [])
}
