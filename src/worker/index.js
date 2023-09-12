import { convertToEmpty } from './convertToEmpty.js'

// use magic string to avoid including 'workbox-core'
// import { cacheNames } from 'workbox-core'
const precacheCacheName = `workbox-precache-v2-${self.registration.scope}`

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const indexRequest = await waitCleanup(precacheCacheName)

      const cache = await caches.open(precacheCacheName)
      const indexResponse = await cache.match(indexRequest)
      if (!indexResponse) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('Index response undefined')
      }
      await cache.put(indexRequest, new Response(
        convertToEmpty(await indexResponse.text()), {
          headers: Object.fromEntries(indexResponse.headers)
        })
      )
    } catch (e) {
      // just in case to avoid breaking worker
      console.error('Unexpected behaviour!', e)
    }
  })())
})

/**
 * Waits single index request up to 60 seconds and returns it.
 * @param precacheCacheName
 * @returns {Promise<Request>}
 */
async function waitCleanup (precacheCacheName) {
  const cache = await caches.open(precacheCacheName)

  // wait until only one index exists after cleanupOutdatedCaches
  let indexes = []
  let maxTries = 60 * 2 // because of 2 * 500ms
  do {
    indexes = await cache.keys('/', { ignoreSearch: true })
    // skip 1 second and try again
    if (indexes.length !== 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    maxTries--
  } while (indexes.length !== 1 && maxTries > 0)

  if (indexes.length !== 1) {
    throw new Error('Couldn\'t find single index page')
  }

  return indexes[0]
}
