import { useState } from 'react'
import Ikon from './Ikon'

const sar = { position: 'relative', margin: '12px 0' }
const inp = { margin: 0, paddingRight: 46 }
const btn = { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', boxShadow: 'none', border: 'none', padding: 6, margin: 0, width: 'auto', color: '#7fae9b', cursor: 'pointer', display: 'flex', alignItems: 'center' }

export default function SifreInput({ value, onChange, placeholder }) {
  const [goster, setGoster] = useState(false)
  return (
    <div style={sar}>
      <input style={inp} type={goster ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} />
      <button type="button" style={btn} onClick={() => setGoster(v => !v)} aria-label="Sifreyi goster veya gizle">
        <Ikon ad={goster ? 'gozKapali' : 'goz'} boyut={19} />
      </button>
    </div>
  )
}
