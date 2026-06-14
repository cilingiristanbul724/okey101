import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Chat from './Chat'
import GeriSayim from '../utils/GeriSayim'
import Durum from '../Durum'
import { konumAl, mesafeKm } from '../utils/konum'

const yesilButon = { background: 'linear-gradient(180deg, #16a34a, #15803d)' }
const tehlikeButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)' }
const altinButon = { background: 'linear-gradient(180deg, #e8b923, #c99a12)', color: '#2a2200' }

function Avatar({ p }) {
  if (p && p.foto_url) return <img className="avatar" src={p.foto_url} alt="" />
  const harf = ((p && (p.kullanici_adi || p.ad_soyad)) || '?').charAt(0).toUpperCase()
  return <div className="avatar avatar-bos">{harf}</div>
}

export default function MasaDetay() {
  const { id } = useParams()
  const [masa, setMasa] = useState(null)
  const [acan, setAcan] = useState(null)
  const [oyuncular, setOyuncular] = useState([])
  const [benimId, setBenimId] = useState(null)
  const [uzaklik, setUzaklik] = useState(null)
  const [iliskiler, setIliskiler] = useState([])

  async function yukle() {
    const res = await supabase.auth.getUser()
    const uid = res.data.user ? res.data.user.id : null
    setBenimId(uid)

    const { data: m } = await supabase.from('masalar').select('*').eq('id', id).single()
    setMasa(m)
    if (m) {
      const { data: ap } = await supabase.from('profiles').select('id,kullanici_adi,ad_soyad,foto_url,son_gorulme').eq('id', m.acan_id).single()
      setAcan(ap)
      if (m.enlem != null) {
        konumAl().then(k => setUzaklik(mesafeKm(k.enlem, k.boylam, m.enlem, m.boylam))).catch(() => {})
      }
    }

    const { data: o } = await supabase.from('masa_oyunculari').select('*').eq('masa_id', id)
    const oyl = o || []
    const idler = oyl.map(x => x.oyuncu_id)
    const harita = {}
    if (idler.length) {
      const { data: pr } = await supabase.from('profiles').select('id,kullanici_adi,ad_soyad,foto_url,son_gorulme').in('id', idler)
      for (const p of pr || []) harita[p.id] = p
    }
    setOyuncular(oyl.map(x => ({ ...x, profil: harita[x.oyuncu_id] })))

    if (uid) {
      const { data: rel } = await supabase.from('arkadaslar').select('isteyen_id,istenen_id,durum')
        .or('isteyen_id.eq.' + uid + ',istenen_id.eq.' + uid)
      setIliskiler(rel || [])
    }
  }
  useEffect(() => { yukle() }, [id])

  function iliskiDurum(hedefId) {
    const r = iliskiler.find(x =>
      (x.isteyen_id === benimId && x.istenen_id === hedefId) ||
      (x.isteyen_id === hedefId && x.istenen_id === benimId))
    return r ? r.durum : null
  }

  async function onayla(satirId) {
    await supabase.from('masa_oyunculari').update({ katilim_durumu: 'Onayli' }).eq('id', satirId)
    yukle()
  }
  async function reddet(satirId) {
    await supabase.from('masa_oyunculari').update({ katilim_durumu: 'Red' }).eq('id', satirId)
    yukle()
  }
  async function masadanCik() {
    if (!benimId) return
    await supabase.from('masa_oyunculari').delete().eq('masa_id', id).eq('oyuncu_id', benimId)
    alert('Masadan çıktın.')
    yukle()
  }
  async function arkadasEkle(hedefId) {
    if (!benimId || !hedefId || hedefId === benimId) return
    const mevcut = iliskiDurum(hedefId)
    if (mevcut === 'Kabul') return alert('Zaten arkadaşsınız.')
    if (mevcut === 'Beklemede') return alert('Arkadaşlık isteği zaten var.')
    const { error } = await supabase.from('arkadaslar').insert({