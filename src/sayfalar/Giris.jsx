import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Giris() {
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')

  async function kayitOl() {
    const { error } = await supabase.auth.signUp({ email, password: sifre })
    alert(error ? error.message : 'Kayıt başarılı! E-postanı onayla.')
  }
  async function girisYap() {
    const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })
    alert(error ? error.message : 'Giriş başarılı!')
  }

  return (
    <div className="sayfa">
      <h2>Giriş / Kayıt</h2>
      <input placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Şifre" type="password" value={sifre} onChange={e => setSifre(e.target.value)} />
      <button onClick={girisYap}>Giriş Yap</button>
      <button onClick={kayitOl}>Kayıt Ol</button>
    </div>
  )
}