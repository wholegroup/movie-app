import { Serwist } from 'serwist'
import { defaultCache } from '@serwist/next/worker'
import runtimeCaching from './sw_cache.js'
import { convertToEmpty } from './convertToEmpty.js'

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    navigateFallback: '/',
    navigateFallbackDenylist: [
      /api\/.*/,
      /auth\/.*/,
      /noprecache\/.*/
    ]
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false, // disable parallels network requests and fallback to index
  runtimeCaching: [
    ...runtimeCaching,
    ...defaultCache
  ],
})

serwist.addEventListeners()

// Clean the index/app page, remove any blocks and leave it blank
// it's required to avoid ghosted blinking
const precacheCacheName = serwist.precacheStrategy?.cacheName || '???'
if (!precacheCacheName) {
  throw new Error('Precache cache name is not defined.')
}

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
