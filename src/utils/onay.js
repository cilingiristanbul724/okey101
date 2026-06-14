// Native confirm()/prompt() yerine site temasina uygun modal.
// onay(mesaj) -> Promise<boolean>
// girdiAl(mesaj) -> Promise<string|null>

let _ac = null
let _coz = null

export function _baglaAc(fn) { _ac = fn }

function ac(ayar) {
  return new Promise(resolve => {
    if (!_ac) {
      // Yedek: modal yuklenmemisse native davranis
      if (ayar.girdi) resolve(window.prompt(ayar.mesaj))
      else resolve(window.confirm(ayar.mesaj))
      return
    }
    _coz = resolve
    _ac(ayar)
  })
}

export function onay(mesaj, secenek = {}) {
  return ac({
    mesaj,
    girdi: false,
    baslik: secenek.baslik || '',
    onayMetin: secenek.onayMetin || 'Evet',
    iptalMetin: secenek.iptalMetin || 'Vazgeç',
    tehlike: !!secenek.tehlike,
  })
}

export function girdiAl(mesaj, secenek = {}) {
  return ac({
    mesaj,
    girdi: true,
    baslik: secenek.baslik || '',
    onayMetin: secenek.onayMetin || 'Gönder',
    iptalMetin: secenek.iptalMetin || 'Vazgeç',
    placeholder: secenek.placeholder || '',
  })
}

export function _cevapla(sonuc) {
  const r = _coz
  _coz = null
  if (_ac) _ac(null)
  if (r) r(sonuc)
}
