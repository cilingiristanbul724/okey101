import { useEffect, useState } from 'react'
import { _baglaAc, _cevapla } from './utils/onay'

export default function Onay() {
  const [ayar, setAyar] = useState(null)
  const [deger, setDeger] = useState('')

  useEffect(() => {
    _baglaAc(a => { setAyar(a); if (a) setDeger('') })
    return () => _baglaAc(null)
  }, [])

  if (!ayar) return null

  const iptalSonuc = ayar.girdi ? null : false
  function onayla() { _cevapla(ayar.girdi ? deger.trim() : true) }
  function iptal() { _cevapla(iptalSonuc) }

  const kaplama = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100000, padding: '20px', animation: 'onayGir .18s ease-out',
  }
  const kutu = {
    width: 'min(380px, 100%)', background: 'linear-gradient(160deg,#0e3a2a,#0a2c20)',
    border: '1px solid #1c5a42', borderRadius: '18px', padding: '22px 20px',
    boxShadow: '0 18px 50px rgba(0,0,0,.55)', color: '#eaf3ee',
  }
  const baslikStil = { margin: '0 0 8px', fontSize: '17px', fontWeight: 800, color: '#fff' }
  const mesajStil = { margin: '0 0 16px', fontSize: '14.5px', lineHeight: 1.55, color: '#cfe3d8', fontWeight: 500 }
  const girdiStil = {
    width: '100%', boxSizing: 'border-box', margin: '0 0 16px', padding: '11px 13px',
    borderRadius: '11px', background: '#0c3325', border: '1px solid #1c5a42',
    color: '#eaf3ee', fontSize: '14px',
  }
  const butonSar = { display: 'flex', justifyContent: 'flex-end', gap: '10px' }
  const iptalStil = {
    margin: 0, padding: '10px 18px', borderRadius: '11px', background: 'transparent',
    border: '1px solid #2a6b50', color: '#cfe3d8', boxShadow: 'none', fontWeight: 600, fontSize: '14px',
  }
  const onayStil = {
    margin: 0, padding: '10px 18px', borderRadius: '11px',
    background: 'linear-gradient(180deg,#16a34a,#15803d)', border: 'none',
    color: '#fff', fontWeight: 700, fontSize: '14px',
  }
  const tehlikeStil = { ...onayStil, background: 'linear-gradient(180deg,#dc2626,#b91c1c)' }

  return (
    <div style={kaplama} onClick={iptal}>
      <style>{'@keyframes onayGir{from{opacity:0}to{opacity:1}}'}</style>
      <div style={kutu} onClick={e => e.stopPropagation()}>
        {ayar.baslik && <h3 style={baslikStil}>{ayar.baslik}</h3>}
        <p style={mesajStil}>{ayar.mesaj}</p>
        {ayar.girdi && (
          <input autoFocus style={girdiStil} value={deger} placeholder={ayar.placeholder}
            onChange={e => setDeger(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onayla() }} />
        )}
        <div style={butonSar}>
          <button style={iptalStil} onClick={iptal}>{ayar.iptalMetin}</button>
          <button style={ayar.tehlike ? tehlikeStil : onayStil} onClick={onayla}>{ayar.onayMetin}</button>
        </div>
      </div>
    </div>
  )
}
