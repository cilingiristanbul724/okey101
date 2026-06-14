export function cevrimiciMi(sonGorulme) {
  if (!sonGorulme) return false
  return (Date.now() - new Date(sonGorulme).getTime()) < 75000
}

export default function Durum({ sonGorulme }) {
  const online = cevrimiciMi(sonGorulme)
  return (
    <span className={'durum ' + (online ? 'durum-on' : 'durum-off')}>
      <span className="durum-lamba" />
      {online ? 'çevrimiçi' : 'çevrimdışı'}
    </span>
  )
}
