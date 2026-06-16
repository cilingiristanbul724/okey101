import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { zamanMs, gecenSure, saatBicim } from '../utils/zaman'
import Ikon from '../Ikon'

const OKUNDU_KEY = 'okey101-bildirim-okundu'

const satirStil = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', marginBottom: 8 }
const icMetin = { flex: 1, minWidth: 0 }
const baslikStil = { fontWeight: 700 }
const zamanStil = { whiteSpace: 'nowrap', fontSize: 12 }
const noktaStil = { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#e8b923', marginLeft: 6, verticalAlign: 'middle' }
const okunduBtn = { background: 'linear-gradient(180deg, #16a34a, #15803d)', marginTop: 8 }
const ikonKutuStil = (renk) => ({ width: 42, height: 42, borderRadius: 12, background: renk, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })

export default function Bildirimler() {
  const [benimId, setBenimId] = useState(null)
  const [liste, setListe] = useState([])
  const [hazir, setHazir] = useState(false)
  const [sonOkundu, setSonOkundu] = useState(() => Number(localStorage.getItem(OKUNDU_KEY) || 0))
  const navigate = useNavigate()

  useEffect(() => { yukle() }, [])

  async function yukle() {
    setHazir(false)
    const res = await supabase.auth.getUser()
    const uid = res.data.user ? res.data.user.id : null
    setBenimId(uid)
    if (!uid) { setHazir(true); return }

    const bildirimler = []

    const { data: mesajlar } = await supabase.from('ozel_mesajlar')
      .select('id,icerik,created_at,gonderen_id,gonderen:profiles!ozel_mesajlar_gonderen_id_fkey(id,kullanici_adi,ad_soyad)')
      .eq('alici_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)
    for (const m of mesajlar || []) {
      const g = m.gonderen
      const ad = g ? (g.kullanici_adi || g.ad_soyad || 'Birisi') : 'Birisi'
      bildirimler.push({
        id: 'mesaj-' + m.id,
        baslik: 'Yeni mesajınız var',
        alt: ad + ' size mesaj gönderdi',
        ts: zamanMs(m.created_at),
        link: '/mesajlar',
        renk: '#dc2626',
        ikon: 'mesaj',
      })
    }

    const { data: katilimlarim } = await supabase.from('masa_oyunculari')
      .select('*').eq('oyuncu_id', uid).eq('katilim_durumu', 'Onayli')

    const { data: masalarim } = await supabase.from('masalar').select('*').eq('acan_id', uid)
    const masamIdler = (masalarim || []).map(m => m.id)

    const masaHarita = {}
    for (const m of masalarim || []) masaHarita[m.id] = m
    const eksikIdler = (katilimlarim || []).map(k => k.masa_id).filter(id => !masaHarita[id])
    if (eksikIdler.length) {
      const { data: ekMasalar } = await supabase.from('masalar').select('*').in('id', eksikIdler)
      for (const m of ekMasalar || []) masaHarita[m.id] = m
    }

    for (const k of katilimlarim || []) {
      const masa = masaHarita[k.masa_id]
      if (!masa) continue
      const { count } = await supabase.from('masa_oyunculari')
        .select('id', { count: 'exact', head: true })
        .eq('masa_id', masa.id).eq('katilim_durumu', 'Onayli')
      const digerSayi = count || 1
      const ts = zamanMs(k.created_at) || zamanMs(masa.created_at)
      bildirimler.push({
        id: 'eslesme-' + masa.id,
        baslik: 'Masa eşleşmesi',
        alt: digerSayi + ' oyuncu ile eşleştiniz',
        ts,
        link: '/masa/' + masa.id,
        renk: '#16a34a',
        ikon: 'masalar',
      })
      const saatStr = saatBicim(masa.bitis_zamani)
      bildirimler.push({
        id: 'hatirlatma-' + masa.id,
        baslik: 'Masa hatırlatması',
        alt: '101 Okey Masası için buluşma — ' + (masa.mekan_adi || 'masa') + (saatStr ? (', masa saat ' + saatStr + "'a kadar açık") : ''),
        ts,
        link: '/masa/' + masa.id,
        renk: '#2563eb',
        ikon: 'pin',
      })
    }

    if (masamIdler.length) {
      const { data: katilanlar } = await supabase.from('masa_oyunculari')
        .select('*').in('masa_id', masamIdler).limit(50)
      const oyuncuIdler = [...new Set((katilanlar || []).map(k => k.oyuncu_id).filter(x => x && x !== uid))]
      const pmap = {}
      if (oyuncuIdler.length) {
        const { data: pr } = await supabase.from('profiles').select('id,kullanici_adi,ad_soyad').in('id', oyuncuIdler)
        for (const p of pr || []) pmap[p.id] = p
      }
      for (const k of katilanlar || []) {
        if (!k.oyuncu_id || k.oyuncu_id === uid) continue
        const p = pmap[k.oyuncu_id]
        const ad = p ? (p.kullanici_adi || p.ad_soyad || 'Bir oyuncu') : 'Bir oyuncu'
        bildirimler.push({
          id: 'katilim-' + k.id,
          baslik: 'Yeni oyuncu eklendi',
          alt: ad + ' masanıza katıldı',
          ts: zamanMs(k.created_at),
          link: '/masa/' + k.masa_id,
          renk: '#7c3aed',
          ikon: 'arkadaslar',
        })
      }
    }

    bildirimler.sort((a, b) => (b.ts || 0) - (a.ts || 0))
    setListe(bildirimler)
    setHazir(true)
  }

  function tumunuOkundu() {
    const simdi = Date.now()
    localStorage.setItem(OKUNDU_KEY, String(simdi))
    setSonOkundu(simdi)
  }

  if (!hazir) return <p className="sayfa">Yükleniyor...</p>
  if (!benimId) return <p className="sayfa">Bildirimleri görmek için giriş yapmalısın.</p>

  return (
    <div className="sayfa">
      <h2>Bildirimler</h2>
      {liste.length === 0 && <p className="ipucu">Henüz bildirimin yok.</p>}
      {liste.map(b => {
        const yeni = (b.ts || 0) > sonOkundu
        return (
          <div key={b.id} className="kart" style={satirStil} onClick={() => navigate(b.link)}>
            <div style={ikonKutuStil(b.renk)}><Ikon ad={b.ikon} boyut={20} /></div>
            <div style={icMetin}>
              <div style={baslikStil}>{b.baslik}{yeni && <span style={noktaStil} />}</div>
              <div className="ipucu">{b.alt}</div>
            </div>
            <div className="ipucu" style={zamanStil}>{gecenSure(b.ts)}</div>
          </div>
        )
      })}
      {liste.length > 0 && (
        <button onClick={tumunuOkundu} style={okunduBtn}>Tümünü Okundu İşaretle</button>
      )}
    </div>
  )
}
