import { cacheNames } from 'workbox-core'
import { convertToEmpty } from './convertToEmpty.js'

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheNames.precache)
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
