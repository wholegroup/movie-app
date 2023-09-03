import { convertToEmpty } from './convertToEmpty.js'

// use magic string to avoid including 'workbox-core'
// import { cacheNames } from 'workbox-core'
const precacheCacheName = `workbox-precache-v2-${self.registration.scope}`

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(precacheCacheName)
    for (const nextRequest of await cache.keys()) {
      if (new URL(nextRequest.url).pathname !== '/') {
        continue
      }

      const nextResponse = await cache.match(nextRequest)
      await cache.put(nextRequest, new Response(
        convertToEmpty(await nextResponse.text()),
        { headers: await nextResponse.headers })
      )
    }
  })())
})
