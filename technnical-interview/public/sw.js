const STATIC_CACHE = 'hn-shell-v1'
const API_CACHE = 'hn-api-v1'
const API_ORIGIN = 'https://hacker-news.firebaseio.com'
const MAX_API_ENTRIES = 10

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(['/', '/index.html'])),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length <= maxEntries) {
    return
  }

  await cache.delete(keys[0])
  await trimCache(cacheName, maxEntries)
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE)
        return (await cache.match('/index.html')) || Response.error()
      }),
    )
    return
  }

  if (url.origin === API_ORIGIN) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          const cache = await caches.open(API_CACHE)
          cache.put(request, response.clone())
          await trimCache(API_CACHE, MAX_API_ENTRIES)
          return response
        })
        .catch(async () => {
          const cache = await caches.open(API_CACHE)
          return (await cache.match(request)) || Response.error()
        }),
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        const response = await fetch(request)
        const cache = await caches.open(STATIC_CACHE)
        cache.put(request, response.clone())
        return response
      }),
    )
  }
})
