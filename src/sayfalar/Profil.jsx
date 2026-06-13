import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Profil() {
  const [profil, setProfil] = useState(null)

  useEffect(() => {
    async function yukle() {
      const res = await supabase.auth.getUser()
      const user = res.data.user
      if (!user) return

      await supabase.from('profiles').upsert(
        { id: user.id, ad: user.email },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      const { data } = await supabase.from('profiles')
        .select('*').eq('id', user.id).single()
      setProfil(data)
    }
    yukle()
  }, [])

  if (!profil) return <p className="sayfa">Profil yükleniyor... (giriş yaptığından emin ol)</p>

  return (
    <div className="sayfa">
      <h2>Profilim</h2>
      <p>Ad: {profil.ad}</p>
      <p>Puan: {profil.puan}</p>
      <p>Seviye: {profil.seviye}</p>
      <p>Güven Sertifikası: {profil.guven_sertifikasi ? '✅ Var' : '— Yok'}</p>
    </div>
  )
}