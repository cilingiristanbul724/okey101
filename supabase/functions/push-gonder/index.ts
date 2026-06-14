// ============================================================
// 101 RakipBul - Web Push gonderici (Supabase Edge Function)
//
// KURULUM:
//   1) npx web-push generate-vapid-keys  (Public + Private key uretir)
//   2) Public key -> src/utils/push.js icindeki VAPID_PUBLIC
//   3) Secret'lari ayarla:
//        supabase secrets set VAPID_PUBLIC="..." VAPID_PRIVATE="..." VAPID_SUBJECT="mailto:bombilla3434@gmail.com"
//   4) Deploy:
//        supabase functions deploy push-gonder --no-verify-jwt
//   5) Supabase > Database > Webhooks ile iki webhook olustur (INSERT):
//        - tablo: masa_oyunculari  -> POST  <function-url>
//        - tablo: mesajlar         -> POST  <function-url>
//      (SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY otomatik gelir.)
// ============================================================

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC') ?? ''
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE') ?? ''
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:bombilla3434@gmail.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
const db = createClient(SUPABASE_URL, SERVICE_ROLE)

async function isim(id: string): Promise<string> {
  const { data } = await db.from('profiles').select('kullanici_adi,ad_soyad').eq('id', id).single()
  return data ? (data.kullanici_adi || data.ad_soyad || 'Birisi') : 'Birisi'
}

async function gonder(kullaniciIdler: string[], yuk: Record<string, unknown>) {
  const idler = [...new Set(kullaniciIdler.filter(Boolean))]
  if (!idler.length) return
  const { data: aboneler } = await db.from('push_abonelikleri').select('*').in('kullanici_id', idler)
  for (const a of aboneler ?? []) {
    try {
      await webpush.sendNotification(a.abonelik, JSON.stringify(yuk))
    } catch (e) {
      const kod = (e as { statusCode?: number }).statusCode
      if (kod === 404 || kod === 410) {
        await db.from('push_abonelikleri').delete().eq('endpoint', a.endpoint)
      }
    }
  }
}

Deno.serve(async (req) => {
  try {
    const olay = await req.json()
    const tablo: string = olay.table
    const kayit = olay.record
    if (!kayit) return new Response('kayit yok', { status: 200 })

    if (tablo === 'masa_oyunculari') {
      const { data: masa } = await db.from('masalar').select('acan_id').eq('id', kayit.masa_id).single()
      if (masa?.acan_id && masa.acan_id !== kayit.oyuncu_id) {
        const ad = await isim(kayit.oyuncu_id)
        await gonder([masa.acan_id], {
          baslik: 'Yeni kat\u0131l\u0131m talebi',
          govde: ad + ' masana kat\u0131lmak istiyor.',
          url: '/okey101/masa/' + kayit.masa_id,
          tag: 'masa-' + kayit.masa_id,
        })
      }
    } else if (tablo === 'mesajlar') {
      const { data: masa } = await db.from('masalar').select('acan_id').eq('id', kayit.masa_id).single()
      const { data: oyuncular } = await db.from('masa_oyunculari').select('oyuncu_id,katilim_durumu').eq('masa_id', kayit.masa_id)
      const alicilar: string[] = []
      if (masa?.acan_id) alicilar.push(masa.acan_id)
      for (const o of oyuncular ?? []) {
        if (o.katilim_durumu === 'Onayli') alicilar.push(o.oyuncu_id)
      }
      const ad = await isim(kayit.gonderen_id)
      const metin = String(kayit.icerik ?? '').slice(0, 80)
      await gonder(alicilar.filter((x) => x !== kayit.gonderen_id), {
        baslik: ad + ' \u2014 masa sohbeti',
        govde: metin,
        url: '/okey101/masa/' + kayit.masa_id,
        tag: 'mesaj-' + kayit.masa_id,
      })
    }

    return new Response('ok', { status: 200 })
  } catch (e) {
    return new Response('hata: ' + (e as Error).message, { status: 200 })
  }
})
