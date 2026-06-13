import { supabase } from '../supabaseClient'

export default function BulusmaOnay({ masaId }) {
  async function geldim() {
    const res = await supabase.auth.getUser()
    const user = res.data.user
    if (!user) return alert('Önce giriş yapmalısın!')

    const { error } = await supabase.from('bulusma_onaylari').upsert(
      { masa_id: masaId, oyuncu_id: user.id, geldi: true },
      { onConflict: 'masa_id,oyuncu_id' }
    )
    alert(error ? error.message : 'Gelişin onaylandı! 4 kişi tamamlanınca +100 puan.')
  }

  return <button onClick={geldim}>Buluşmaya Geldim</button>
}