import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC')
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE')
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:bombilla3434@gmail.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

const sb = createClient(SUPABASE_URL, SERVICE_ROLE)

const TABAN = '/okey101'

async function kullaniciyaGonder(uid, payload) {
  if (!uid) return
  const { data } = await sb.from('push_abonelikleri').select('id, abonelik').eq('kullanici_id', uid)
  for (const satir of data || []) {
    try {
      await webpush.sendNotification(satir.abonelik, JSON.stringify(payload))
    } catch (e) {
      const kod = e && e.statusCode
      if (kod === 404 || kod === 410) {
        await sb.from('push_abonelikleri').delete().eq('id', satir.id)
      }
    }
  }
}

async function adGetir(uid) {
  const { data } = await sb.from('profiles').select('kullanici_adi, ad_soyad').eq('id', uid).single()
  if (!data) return 'Biri'
  return data.kullanici_adi || data.ad_soyad || 'Biri'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const govde = await req.json()
    const table = govde.table
    const record = govde.record || {}

    if (table === 'mesajlar') {
      const masaId = record.masa_id
      const gonderen = record.gonderen_id
      const m = await sb.from('masalar').select('acan_id, baslik, mekan_adi').eq('id', masaId).single()
      const masa = m.data
      const alicilar = new Set()
      if (masa && masa.acan_id) alicilar.add(masa.acan_id)
      const oy = await sb.from('masa_oyunculari').select('oyuncu_id').eq('masa_id', masaId).eq('katilim_durumu', 'Onayli')
      for (const o of oy.data || []) alicilar.add(o.oyuncu_id)
      alicilar.delete(gonderen)
      const baslik = (masa && (masa.baslik || masa.mekan_adi)) || 'Masa sohbeti'
      const ad = await adGetir(gonderen)
      for (const uid of alicilar) {
        await kullaniciyaGonder(uid, { baslik, govde: ad + ': ' + (record.icerik || ''), url: TABAN + '/masa/' + masaId, tag: 'masa-' + masaId })
      }
    } else if (table === 'masa_oyunculari') {
      const masaId = record.masa_id
      const m = await sb.from('masalar').select('acan_id, baslik, mekan_adi').eq('id', masaId).single()
      const masa = m.data
      if (masa && masa.acan_id && masa.acan_id !== record.oyuncu_id) {
        const ad = await adGetir(record.oyuncu_id)
        await kullaniciyaGonder(masa.acan_id, { baslik: 'Yeni katılım talebi', govde: ad + ' masana katılmak istiyor.', url: TABAN + '/masa/' + masaId, tag: 'talep-' + masaId })
      }
    } else if (table === 'ozel_mesajlar') {
      const ad = await adGetir(record.gonderen_id)
      await kullaniciyaGonder(record.alici_id, { baslik: ad, govde: record.icerik || 'Yeni mesaj', url: TABAN + '/ozel/' + record.gonderen_id, tag: 'ozel-' + record.gonderen_id })
    } else if (table === 'eslesme') {
      const masaId = record.masa_id
      const m = await sb.from('masalar').select('baslik, mekan_adi').eq('id', masaId).single()
      const masa = m.data
      const baslik = (masa && (masa.baslik || masa.mekan_adi)) || 'Masa'
      await kullaniciyaGonder(record.oyuncu_id, { baslik: 'Masaya eşleştin! 🎉', govde: baslik + ' masasına katılımın onaylandı.', url: TABAN + '/masa/' + masaId, tag: 'eslesme-' + masaId })
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, hata: String(e) }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
