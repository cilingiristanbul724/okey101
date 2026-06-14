import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Durum from '../Durum'
import Ikon from '../Ikon'
import { engelliMi, engelle, engelKaldir, sikayetEt } from '../utils/moderasyon'

const altinButon = { background: 'linear-gradient(180deg, #e8b923, #c99a12)', color: '#2a2200' }
const kirmiziButon = { background: 'linear-gradient(180deg, #dc2626, #b91c1c)' }
const griButon = { background: '#6b7280' }
const adStil = { fontSize: '18px', fontWeight: 800, color: 'var(--metin)', margin: '0 0 4px' }

function cinsiyetIkon(c) {
  if (c === 'Kad\u0131n') return 'kadin'
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
    if (error) return alert('G\u00f6nderilemedi: ' + error.message)
    setDurum('Beklemede')
  }
  async function engelDegistir() {
    if (!benimId) return navigate('/giris')
    if (engel) { await engelKaldir(benimId, id); setEngel(false) }
    else {
      if (!window.confirm('Bu kullan\u0131c\u0131y\u0131 engellemek istiyor musun? Mesajlar\u0131 sana g\u00f6r\u00fcnmez olur.')) return
      await engelle(benimId, id); setEngel(true)
    }
  }
  async function sikayet() {
    if (!benimId) return navigate('/giris')
    const sebep = window.prompt('\u015eikayet sebebini k\u0131saca yaz:')
    if (!sebep) return
    const { error } = await sikayetEt(benimId, id, sebep)
    alert(error ? 'G\u00f6nderilemedi: ' + error.message : '\u015eikayetin al\u0131nd\u0131. Te\u015fekk\u00fcrler.')
  }

  if (!hazir) return <p className="sayfa">Y\u00fckleniyor...</p>
  if (!profil) return <p className="sayfa">Kullan\u0131c\u0131 bulunamad\u0131.</p>
  const benim = benimId === profil.id

  return (
    <div className="sayfa">
      <h2>\u00dcye Profili</h2>
      <div className="profil-foto-alani">
        {profil.foto_url
          ? <img className="profil-foto" src={profil.foto_url} alt="" />
          : <div className="profil-foto profil-foto-bos"><Ikon ad={cinsiyetIkon(profil.cinsiyet)} boyut={56} /></div>}
      </div>
      <div className="kart ortala">
        <p style={adStil}>{profil.kullanici_adi || profil.ad_soyad || 'Kullan\u0131c\u0131'}</p>
        {profil.ad_soyad && <div>{profil.ad_soyad}</div>}
        {profil.cinsiyet && <div className="ipucu">{profil.cinsiyet}</div>}
        <div style= marginTop: 6 ><Durum sonGorulme={profil.son_gorulme} /></div>
      </div>
      {!benim && (
        <div className="kart">
          {durum === 'Kabul'
            ? <span className="rozet rozet-yesil">\u2713 Arkada\u015fs\u0131n\u0131z</span>
            : durum === 'Beklemede'
              ? <span className="ipucu">\u0130stek g\u00f6nderildi</span>
              : <button onClick={arkadasEkle} style={altinButon}>Arkada\u015f Ekle</button>}
          <Link to={'/ozel/' + profil.id}><button>Mesaj G\u00f6nder</button></Link>
          <button onClick={engelDegistir} style={griButon}>{engel ? 'Engeli Kald\u0131r' : 'Engelle'}</button>
          <button onClick={sikayet} style={kirmiziButon}>\u015eikayet Et</button>
        </div>
      )}
      {benim && <Link to="/profil"><button style={altinButon}>Profilimi D\u00fczenle</button></Link>}
    </div>
  )
}
