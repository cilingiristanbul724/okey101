import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { zamanMs } from '../utils/zaman'
import { pushTetikle } from '../utils/push'
import Durum from '../Durum'

const altinButon = { background: 'linear-gradient(180deg, #e8b923, #c99a12)', color: '#2a2200' }
const kirmiziButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)' }
const yesilButon = { background: 'linear-gradient(180deg, #16a34a, #15803d)' }

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
  const [iliskiler, setIliskiler] = useState([])
  const [aktifMasam, setAktifMasam] = useState(null)

  async function yukle() {
    const res = await supabase.auth.getUser()
    const uid = res.data.user ? res.data.user.id : null
    setBenimId(uid)
    if (!uid) return

    const { data: kabul } = await supabase.from('arkadaslar')
      .select('*, isteyen:profiles!arkadaslar_isteyen_id_fkey(id,kullanici_adi,ad_soyad,foto_url,son_gorulme), istenen:profiles!arkadaslar_istenen_id_fkey(id,kullanici_adi,ad_soyad,foto_url,son_gorulme)')
      .eq('durum', 'Kabul')
      .or('isteyen_id.eq.' + uid + ',istenen_id.eq.' + uid)
    setArkadaslar(kabul || [])

    const { data: bekleyen } = await supabase.from('arkadaslar')
      .select('*, isteyen:profiles!arkadaslar_isteyen_id_fkey(id,kullanici_adi,ad_soyad,foto_url)')
      .eq('durum', 'Beklemede').eq('istenen_id', uid)
    setIstekler(bekleyen || [])

    const { data: rel } = await supabase.from('arkadaslar').select('isteyen_id,istenen_id,durum')
      .or('isteyen_id.eq.' + uid + ',istenen_id.eq.' + uid)
    setIliskiler(rel || [])

    const { data: masalarim } = await supabase.from('masalar')
      .select('id, baslik, mekan_adi, bitis_zamani, durum, created_at')
      .eq('acan_id', uid).eq('durum', 'Acik')
      .order('created_at', { ascending: false })
    const aktif = (masalarim || []).find(m => !m.bitis_zamani || zamanMs(m.bitis_zamani) > Date.now())
    setAktifMasam(aktif || null)
  }
  useEffect(() => { yukle() }, [])

  function iliskiDurum(hedefId) {
    const r = iliskiler.find(x =>
      (x.isteyen_id === benimId && x.istenen_id === hedefId) ||
      (x.isteyen_id === hedefId && x.istenen_id === benimId))
    return r ? r.durum : null
  }

  async function ara() {
    if (!arama.trim()) return
    const { data } = await supabase.from('profiles')
      .select('id, kullanici_adi, ad_soyad, foto_url')
      .ilike('kullanici_adi', '%' + arama.trim() + '%')
      .limit(10)
    setSonuclar((data || []).filter(p => p.id !== benimId))
  }

  async function istekGonder(istenenId) {
    const d = iliskiDurum(istenenId)
    if (d === 'Kabul') return alert('Zaten arkadaşsınız.')
    if (d === 'Beklemede') return alert('Arkadaşlık isteği zaten var.')
    const { error } = await supabase.from('arkadaslar')
      .insert({ isteyen_id: benimId, istenen_id: istenenId, durum: 'Beklemede' })
    if (error) return alert('Gönderilemedi: ' + error.message)
    alert('Arkadaşlık isteği gönderildi.')
    yukle()
  }
  async function kabulEt(satirId) {
    await supabase.from('arkadaslar').update({ durum: 'Kabul' }).eq('id', satirId)
    yukle()
  }
  async function reddet(satirId) {
    await supabase.from('arkadaslar').update({ durum: 'Red' }).eq('id', satirId)
    yukle()
  }

  async function davetEt(hedefId) {
    if (!aktifMasam) return alert('Önce bir masa açmalısın.')
    const { data: varMi } = await supabase.from('masa_oyunculari')
      .select('id').eq('masa_id', aktifMasam.id).eq('oyuncu_id', hedefId).limit(1)
    if (varMi && varMi.length) return alert('Bu oyuncu zaten masanda.')
    const kayit = { masa_id: aktifMasam.id, oyuncu_id: hedefId, katilim_durumu: 'Onayli' }
    const { error } = await supabase.from('masa_oyunculari').insert(kayit)
    if (error) return alert('Davet gönderilemedi: ' + error.message)
    pushTetikle('masa_oyunculari', kayit)
    alert('Davet gönderildi! Oyuncu bildirimlerinde masanı görecek.')
  }

  function diger(a) {
    if (a.isteyen && a.isteyen.id !== benimId) return a.isteyen
    return a.istenen
  }

  if (!benimId) return <p className="sayfa">Arkadaş eklemek için giriş yapmalısın.</p>

  const gorulen = new Set()
  const benzersizArkadaslar = []
  for (const a of arkadaslar) {
    const k = diger(a)
    if (!k || gorulen.has(k.id)) continue
    gorulen.add(k.id)
    benzersizArkadaslar.push({ rel: a, kisi: k })
  }

  function EkleButon({ p }) {
    const d = iliskiDurum(p.id)
    if (d === 'Kabul') return <span className="rozet rozet-yesil">✓ Arkadaş</span>
    if (d === 'Beklemede') return <span className="ipucu">İstek gönderildi</span>
    return <button onClick={() => istekGonder(p.id)} style={altinButon}>Ekle</button>
  }

  return (
    <div className="sayfa">
      <h2>Arkadaşlar</h2>

      {aktifMasam && (
        <div className="masa-uyari">
          <b>Açık masan var: {aktifMasam.baslik || aktifMasam.mekan_adi || '101 Okey Masası'}</b>
          <p>Arkadaşlarını "Masama Davet Et" ile masana çağırabilirsin.</p>
        </div>
      )}

      <label>Kullanıcı ara</label>
      <input value={arama} onChange={e => setArama(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && ara()} placeholder="kullanıcı adı..." />
      <button onClick={ara}>Ara</button>

      {sonuclar.map(p => (
        <div key={p.id} className="kart satir">
          <Avatar p={p} />
          <div className="satir-icerik"><div>{p.kullanici_adi || p.ad_soyad}</div></div>
          <EkleButon p={p} />
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
          <button onClick={() => reddet(a.id)} style={kirmiziButon}>Reddet</button>
        </div>
      ))}

      <h3>Arkadaşlarım</h3>
      {benzersizArkadaslar.length === 0 && <p className="ipucu">Henüz arkadaşın yok.</p>}
      {benzersizArkadaslar.map(({ rel, kisi }) => (
        <div key={rel.id} className="kart satir">
          <Avatar p={kisi} />
          <div className="satir-icerik">
            <div>{(kisi && (kisi.kullanici_adi || kisi.ad_soyad)) || 'Arkadaş'}</div>
            <Durum sonGorulme={kisi.son_gorulme} />
          </div>
          {aktifMasam && (
            <button onClick={() => davetEt(kisi.id)} style={yesilButon}>Masama Davet Et</button>
          )}
          <Link to={'/ozel/' + kisi.id}><button>Mesaj</button></Link>
        </div>
      ))}
    </div>
  )
}
