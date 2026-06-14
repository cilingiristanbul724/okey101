// Basit kufur/hakaret filtresi. Eslesen kelimeleri yildizlar.
const KOTU_KELIMELER = [
  'amk', 'aq', 'oc', 'o\u00e7', 'orospu', 'orspu', 'pi\u00e7', 'sik', 'siktir', 'sikeyim',
  'yarrak', 'yarak', 'g\u00f6t', 'gavat', 'pezevenk', 'am\u0131na', 'amina', 'anan\u0131', 'anani',
  'sokay\u0131m', 'pust', 'pu\u015ft', '\u015ferefsiz', 'serefsiz', 'salak', 'gerizekal\u0131',
  'ibne', 'dallama', 'mal herif'
]

export function kufurTemizle(metin) {
  if (!metin) return metin || ''
  let s = String(metin)
  for (const k of KOTU_KELIMELER) {
    const desen = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(desen, 'gi')
    s = s.replace(re, esl => esl[0] + '*'.repeat(Math.max(1, esl.length - 1)))
  }
  return s
}
