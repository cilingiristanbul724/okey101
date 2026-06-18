/* 101 RakipBul - Web Push Service Worker */

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(anahtarlar => Promise.all(anahtarlar.map(a => caches.delete(a))))
    .catch(() => {})
    .then(() => self.clients.claim())
))

function yoluNormalle(u) {
  if (!u) return '/'
  // Eski (github.io) yuk: /okey101 onekini temizle
  if (u.indexOf('/okey101/') === 0) return u.slice('/okey101'.length)
  if (u === '/okey101') return '/'
  return u
}

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
    icon: veri.ikon || '/k%C3%BC%C3%A7%C3%BCk%20olan.png',
    badge: veri.ikon || '/k%C3%BC%C3%A7%C3%BCk%20olan.png',
    data: { url: yoluNormalle(veri.url || '/') },
    tag: veri.tag || undefined,
    renotify: !!veri.tag,
    vibrate: [120, 60, 120],
  }
  event.waitUntil(self.registration.showNotification(baslik, secenekler))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const hedef = yoluNormalle((event.notification.data && event.notification.data.url) || '/')
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
