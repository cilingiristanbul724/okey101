import { supabase } from '../supabaseClient'

// ============================================================
// 1) Terminalde çalıştır:  npx web-push generate-vapid-keys
//    (veya https://vapidkeys.com)
// 2) çıkan "Public Key" değerini aşağıya yapıştır.
//    "Private Key" ise Supabase Edge Function secret'ına (VAPID_PRIVATE) gider.
// ============================================================
export const VAPID_PUBLIC = 'BURAYA_VAPID_PUBLIC_KEY_YAPISTIR'

// Supabase'de deploy edilen Edge Function'ın adı (slug).
export const PUSH_FN = 'clever-action'

export function pushDestekleniyorMu() {
  return typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
}

function vapidHazirMi() {
  return VAPID_PUBLIC && !VAPID_PUBLIC.startsWith('BURAYA')
}

function b64ToUint8(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export async function swKaydet() {
  if (!('serviceWorker' in navigator)) return null
  return navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js')
}

export async function pushAboneOl(kullaniciId) {
  if (!pushDestekleniyorMu()) throw new Error('Tarayıcın push bildirimini desteklemiyor.')
  if (!vapidHazirMi()) throw new Error('VAPID public key henüz ayarlanmamış.')
  if (!kullaniciId) throw new Error('Giriş yapman gerekiyor.')

  const reg = await navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js')
  await navigator.serviceWorker.ready

  const izin = await Notification.requestPermission()
  if (izin !== 'granted') throw new Error('Bildirim izni verilmedi.')

  let abone = await reg.pushManager.getSubscription()
  if (!abone) {
    abone = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64ToUint8(VAPID_PUBLIC),
    })
  }

  const j = abone.toJSON()
  const { error } = await supabase.from('push_abonelikleri')
    .upsert({ kullanici_id: kullaniciId, endpoint: j.endpoint, abonelik: j }, { onConflict: 'endpoint' })
  if (error) throw error
  return true
}

// İzin zaten verilmişse, aboneliği sessizce tazele
export async function pushSessizYenile(kullaniciId) {
  try {
    if (!pushDestekleniyorMu() || !vapidHazirMi() || !kullaniciId) return
    if (Notification.permission !== 'granted') return
    await pushAboneOl(kullaniciId)
  } catch (e) {
    // sessiz geç
  }
}

// Insert sonrası push gönderimini tetikler (Database Webhook yerine, doğrudan çağırır).
// Ana işlemi bloklamaz; hata olsa bile sessizce geçer.
export async function pushTetikle(tablo, kayit) {
  try {
    await supabase.functions.invoke(PUSH_FN, { body: { table: tablo, record: kayit } })
  } catch (e) {
    // sessiz
  }
}
