import Ikon from './Ikon'

const RENK = { 'Kadın': '#ec4899', 'Erkek': '#3b82f6' }

export function cinsiyetIkonAdi(c) {
  if (c === 'Kadın') return 'kadin'
  if (c === 'Erkek') return 'erkek'
  return 'kullanici'
}

export default function CinsiyetRozet({ cinsiyet, boyut = 14 }) {
  if (cinsiyet !== 'Kadın' && cinsiyet !== 'Erkek') return null
  const sar = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: boyut + 9, height: boyut + 9, borderRadius: '50%',
    background: RENK[cinsiyet], color: '#fff', flexShrink: 0,
  }
  return (
    <span style={sar} title={cinsiyet} aria-label={cinsiyet}>
      <Ikon ad={cinsiyet === 'Kadın' ? 'kadin' : 'erkek'} boyut={boyut} />
    </span>
  )
}
