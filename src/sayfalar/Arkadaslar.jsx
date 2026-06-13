import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Avatar({ p }) {
  if (p && p.foto_url) return <img className="avatar" src={p.foto_url} alt="" />
  const harf = ((p && (p.kullanici_adi || p.ad_soyad)) || '?').charAt(0).toUpperCase()
  return <div className="avatar avatar-bos">{harf}</div>
}

export default function Arkadaslar() {
  const [benimId, setBenimId] = useState(null)
  const [arama, setArama] = useState('')
  const [sonuclar, setSonuclar] = useState([])
  const [arkadaslar, setArkadaslar] = useState([])
  const [istekler, setIstekler] = useState([])

  async function yukle() {
    const res = await supabase.auth.getUser()
    const uid = res.data.user ? res.data.user.id : null
    setBenimId(uid)
    if (!uid) return

    const { data: kabul } = await supabase.from('arkadaslar')
      .select('*, isteyen:profiles!arkadaslar_isteyen_id_fkey(id,kullanici_adi,ad_soyad,foto_url), istenen:profiles!arkadaslar_istenen_id_fkey(id,kullanici_adi,ad_soyad,foto_url)')
      .eq('durum', 'Kabul')
      .or('isteyen_id.eq.' + uid + ',istenen_id.eq.' + uid)
    setArkadaslar(kabul || [])

    const { data: bekleyen } = await supabase.from('arkadaslar')
      .select('*, isteyen:profiles!arkadaslar_isteyen_id_fkey(id,kullanici_adi,ad_soyad,foto_url)')
      .eq('durum', 'Beklemede').eq('istenen_id', uid)
    setIstekler(bekleyen || [])
  }
  useEffect(() => { yukle() }, [])

  async function ara() {
    if (!arama.trim()) return
    const { data } = await supabase.from('profiles')
      .select('id, kullanici_adi, ad_soyad, foto_url')
      .ilike('kullanici_adi', '%' + arama.trim() + '%')
      .limit(10)
    setSonuclar((data || []).filter(p => p.id !== benimId))
  }

  async function istekGonder(istenenId) {
    const { error } = await supabase.from('arkadaslar')
      .insert({ isteyen_id: benimId, istenen_id: istenenId, durum: 'Beklemede' })
    alert(error ? 'Gönderilemedi (belki zaten var): ' + error.message : 'Arkadaşlık isteği gönderildi.')
  }
  async function kabulEt(satirId) {
    await supabase.from('arkadaslar').update({ durum: 'Kabul' }).eq('id', satirId)
    yukle()
  }
  async function reddet(satirId) {
    await supabase.from('arkadaslar').update({ durum: 'Red' }).eq('id', satirId)
    yukle()
  }
  function diger(a) {
    if (a.isteyen && a.isteyen.id !== benimId) return a.isteyen
    return a.istenen
  }

  if (!benimId) return <p className="sayfa">Arkadaş eklemek için giriş yapmalısın.</p>

  return (
    <div className="sayfa">
      <h2>Arkadaşlar</h2>

      <label>Kullanıcı ara</label>
      <input value={arama} onChange={e => setArama(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && ara()} placeholder="kullanıcı adı..." />
      <button onClick={ara}>Ara</button>

      {sonuclar.map(p => (
        <div key={p.id} className="kart satir">
          <Avatar p={p} />
          <div className="satir-icerik"><div>{p.kullanici_adi || p.ad_soyad}</div></div>
          <button onClick={() => istekGonder(p.id)} className="btn-altin">Ekle</button>
        </div>
      ))}

      {istekler.length > 0 && <h3>Gelen İstekler</h3>}
      {istekler.map(a => (
        <div key={a.id} className="kart satir">
          <Avatar p={a.isteyen} />
          <div className="satir-icerik">
            <div>{(a.isteyen && a.isteyen.kullanici_adi) || 'Kullanıcı'}</div>
            <div className="ipucu">sana istek gönderdi</div>
          </div>
          <button onClick={() => kabulEt(a.id)}>Kabul</button>
          <button onClick={() => reddet(a.id)} className="btn-kirmizi">Reddet</button>
        </div>
      ))}

      <h3>Arkadaşlarım</h3>
      {arkadaslar.length === 0 && <p className="ipucu">Henüz arkadaşın yok.</p>}
      {arkadaslar.map(a => {
        const k = diger(a)
        return (
          <div key={a.id} className="kart satir">
            <Avatar p={k} />
            <div className="satir-icerik"><div>{(k && (k.kullanici_adi || k.ad_soyad)) || 'Arkadaş'}</div></div>
            {k && <Link to={'/ozel/' + k.id}><button>Mesaj</button></Link>}
          </div>
        )
      })}
    </div>
  )
}
