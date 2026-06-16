import { useState } from 'react'

export default function Tanitim() {
  const [acik, setAcik] = useState(() => {
    try { return localStorage.getItem('okey101-tanitim') !== 'gizli' } catch { return true }
  })

  function gizle() {
    try { localStorage.setItem('okey101-tanitim', 'gizli') } catch (e) {}
    setAcik(false)
  }

  return (
    <div className="tanitim">
      <h1 className="tanitim-bas">Sanal değil, gerçek masa!</h1>
      <div className="tanitim-uyari">
        <b>101 RakipBul</b> bir online oyun sitesi <b>değildir</b>. Amacımız; yakınındaki oyuncuları bir araya getirip <b>yüz yüze</b> okey ve 101 oynayabilmen için sizi gerçek hayatta buluşturmaktır.
      </div>
      {acik && (
        <>
          <div className="adimlar">
            <div className="adim">
              <span className="adim-no">1</span>
              <b>Masa aç ya da katıl</b>
              <span className="adim-ac">Yakınındaki açık bir masaya katıl ya da kendi masanı oluştur.</span>
            </div>
            <div className="adim">
              <span className="adim-no">2</span>
              <b>Sohbet et, buluş</b>
              <span className="adim-ac">Oyuncularla yazışıp yer ve saat ayarla, dilersen canlı konum paylaş.</span>
            </div>
            <div className="adim">
              <span className="adim-no">3</span>
              <b>Yüz yüze oyna</b>
              <span className="adim-ac">Belirlediğiniz mekanda buluşup gerçek masada oyununuzu oynayın.</span>
            </div>
          </div>
          <button type="button" className="tanitim-gizle" onClick={gizle}>Anladım, gizle</button>
        </>
      )}
      {!acik && (
        <button type="button" className="tanitim-link" onClick={() => setAcik(true)}>Nasıl çalışır? ▾</button>
      )}
    </div>
  )
}
