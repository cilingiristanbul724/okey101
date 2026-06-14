import { Link } from 'react-router-dom'

export default function Hakkinda() {
  return (
    <div className="sayfa">
      <h2>Nasıl Çalışır? &amp; Hakkımızda</h2>

      <div className="tanitim">
        <h1 className="tanitim-bas">Sanal değil, gerçek masa! 🀄</h1>
        <p className="tanitim-alt">
          <b>101 RakipBul</b>, yakınındaki oyuncuları bir araya getirip <b>yüz yüze</b> okey ve 101
          oynayabilmen için sizi gerçek hayatta buluşturan bir hizmet platformudur.
        </p>
        <div className="tanitim-uyari">⚠️ Burada çevrimiçi oyun oynanmaz — amaç aynı masada, yüz yüze buluşmaktır.</div>
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
      </div>

      <div className="hakkinda-blok">
        <h3>Biz ne yapıyoruz?</h3>
        <p>
          Çevrende okey/101 oynamak isteyen ama masa ya da oyuncu bulamayan kişileri eşleştiriyoruz.
          Bir masa açıyorsun (mekan, adres, kaç kişi aradığın, süre); yakınındaki oyuncular bunu
          görüp katılıyor. Sohbet edip buluşmayı ayarlıyor ve gerçek hayatta oynuyorsunuz.
        </p>
      </div>

      <div className="hakkinda-blok">
        <h3>Ne yapmıyoruz?</h3>
        <ul>
          <li>Sitede <b>çevrimiçi / online okey oynanmaz.</b></li>
          <li>Para, bahis veya kumar <b>yoktur.</b></li>
          <li>Sadece insanları fiziksel buluşma için bir araya getiririz.</li>
        </ul>
      </div>

      <div className="hakkinda-blok">
        <h3>Güvenlik önerileri</h3>
        <ul>
          <li>Buluşmaları herkese açık, kalabalık mekanlarda yapın.</li>
          <li>Gereksiz kişisel bilgilerini paylaşma.</li>
          <li>Seni rahatsız eden kullanıcıları engelle ve şikayet et.</li>
        </ul>
      </div>

      <Link to="/"><button>Masaları Gör</button></Link>
    </div>
  )
}
