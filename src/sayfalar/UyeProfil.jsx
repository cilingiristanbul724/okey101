import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Durum from '../Durum'
import Ikon from '../Ikon'
import { engelliMi, engelle, engelKaldir, sikayetEt } from '../utils/moderasyon'
import { onay, girdiAl } from '../utils/onay'

const altinButon = { background: 'linear-gradient(180deg, #e8b923, #c99a12)', color: '#2a2200' }
const kirmiziButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)' }
const griButon = { background: '#6b7280' }
const adStil = { fontSize: '18px', fontWeight: 800, color: 'var(--metin)', margin: '0 0 4px' }
const durumStil = { marginTop: '6px' }

function cinsiyetIkon(c) {
  if (c === 'Kadın') return 'kadin'
  if (c === 'Erkek') return 'erkek'
  return 'kullanici'
}

export default function UyeProfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [benimId, setBenimId] = useState(null)
  const [profil, setProfil] = useState(null)
  const [durum, setDurum] = useState(null)
  const [engel, setEngel] = useState(false)
  const [hazir, setHazir] = useState(false)

  async function yukle() {
    const res = await supabase.auth.getUser()
    const uid = res.data.user ? res.data.user.id : null
    setBenimId(uid)
    const { data: p } = await supabase.from('profiles')
      .select('id,kullanici_adi,ad_soyad,cinsiyet,foto_url,son_gorulme').eq('id', id).single()
    setProfil(p)
    if (uid && uid !== id) {
      const { data: rel } = await supabase.from('arkadaslar').select('durum')
        .or('and(isteyen_id.eq.' + uid + ',istenen_id.eq.' + id + '),and(isteyen_id.eq.' + id + ',istenen_id.eq.' + uid + ')')
      const durumlar = (rel || []).map(r => r.durum)
      setDurum(durumlar.includes('Kabul') ? 'Kabul' : durumlar.includes('Beklemede') ? 'Beklemede' : null)
      setEngel(await engelliMi(uid, id))
    }
    setHazir(true)
  }
  useEffect(() => { yukle() }, [id])

  async function arkadasEkle() {
    if (!benimId) return navigate('/giris')
    const { error } = await supabase.from('arkadaslar').insert({ isteyen_id: benimId, istenen_id: id, durum: 'Beklemede' })
    if (error) return alert('Gönderilemedi: ' + error.message)
    setDurum('Beklemede')
  }
  async function engelDegistir() {
    if (!benimId) return navigate('/giris')
    if (engel) { await engelKaldir(benimId, id); setEngel(false) }
    else {
      const ok = await onay('Bu kullanıcıyı engellemek istiyor musun? Mesajları sana görünmez olur.', { baslik: 'Kullanıcıyı Engelle', onayMetin: 'Engelle', tehlike: true })
      if (!ok) return
      await engelle(benimId, id); setEngel(true)
    }
  }
  async function sikayet() {
    if (!benimId) return navigate('/giris')
    const sebep = await girdiAl('Şikayet sebebini kısaca yaz:', { baslik: 'Şikayet Et', onayMetin: 'Gönder', placeholder: 'Sebep...' })
    if (!sebep) return
    const { error } = await sikayetEt(benimId, id, sebep)
    alert(error ? 'Gönderilemedi: ' + error.message : 'Şikayetin alındı. Teşekkürler.')
  }

  if (!hazir) return <p className="sayfa">Yükleniyor...</p>
  if (!profil) return <p className="sayfa">Kullanıcı bulunamadı.</p>
  const benim = benimId === profil.id

  return (
    <div className="sayfa">
      <h2>Üye Profili</h2>
      <div className="profil-foto-alani">
        {profil.foto_url
          ? <img className="profil-foto" src={profil.foto_url} alt="" />
          : <div className="profil-foto profil-foto-bos"><Ikon ad={cinsiyetIkon(profil.cinsiyet)} boyut={56} /></div>}
      </div>
      <div className="kart ortala">
        <p style={adStil}>{profil.kullanici_adi || profil.ad_soyad || 'Kullanıcı'}</p>
        {profil.ad_soyad && <div>{profil.ad_soyad}</div>}
        {profil.cinsiyet && <div className="ipucu">{profil.cinsiyet}</div>}
        <div style={durumStil}><Durum sonGorulme={profil.son_gorulme} /></div>
      </div>
      {!benim && (
        <div className="kart">
          {durum === 'Kabul'
            ? <span className="rozet rozet-yesil">✓ Arkadaşsınız</span>
            : durum === 'Beklemede'
              ? <span className="ipucu">İstek gönderildi</span>
              : <button onClick={arkadasEkle} style={altinButon}>Arkadaş Ekle</button>}
          <Link to={'/ozel/' + profil.id}><button>Mesaj Gönder</button></Link>
          <button onClick={engelDegistir} style={griButon}>{engel ? 'Engeli Kaldır' : 'Engelle'}</button>
          <button onClick={sikayet} style={kirmiziButon}>Şikayet Et</button>
        </div>
      )}
      {benim && <Link to="/profil"><button style={altinButon}>Profilimi Düzenle</button></Link>}
    </div>
  )
}
