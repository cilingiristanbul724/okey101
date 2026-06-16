/* 101 RakipBul - Web Push Service Worker */

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

self.addEventListener('push', event => {
  let veri = {}
  try {
    veri = event.data ? event.data.json() : {}
  } catch (e) {
    veri = { govde: event.data ? event.data.text() : '' }
  }
  const baslik = veri.baslik || '101 RakipBul'
  const govde = (veri.govde && String(veri.govde).trim()) || 'Yeni bir bildirimin var. Açmak için dokun.'
  const secenekler = {
    body: govde,
    icon: veri.ikon || '/okey101/logo192.png',
    badge: veri.ikon || '/okey101/logo192.png',
    data: { url: veri.url || '/okey101/' },
    tag: veri.tag || undefined,
    renotify: !!veri.tag,
    vibrate: [120, 60, 120],
  }
  event.waitUntil(self.registration.showNotification(baslik, secenekler))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const hedef = (event.notification.data && event.notification.data.url) || '/okey101/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(liste => {
      for (const c of liste) {
        if ('focus' in c) {
          c.focus()
          if ('navigate' in c) { try { c.navigate(hedef) } catch (e) {} }
          return
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(hedef)
    })
  )
})
