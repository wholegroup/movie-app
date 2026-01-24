import { Serwist } from 'serwist'
import { defaultCache } from '@serwist/next/worker'
import runtimeCaching from './sw_cache.js'
import { convertToEmpty } from './convertToEmpty.js'

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    navigateFallback: '/',
    navigateFallbackDenylist: [
      /api\/.*/i,
      /auth\/.*/i,
      /noprecache\/.*/i,
      /sitemap\.xml$/i
    ],
    plugins: [
      {
        // Clean up the index/app page, remove any blocks and leave it blank
        // it's required to avoid ghosted blinking
        cacheWillUpdate: async ({ response, request }) => {
          const url = new URL(request.url)
          if (url.pathname !== '/') {
            return response
          }

          const body = await response.text()
          return new Response(convertToEmpty(body), {
            headers: response.headers,
            status: response.status,
            statusText: response.statusText
          })
        }
      }
    ]
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false, // disable parallels network requests and fallback to index
  runtimeCaching: [
    ...runtimeCaching,
    ...defaultCache,
    ...[]
  ]
})

// Some matchers (!sameOrigin and `.*`) of serwist/next's defaultCache handle all requests
// to sse.annualmovies.com via the SW. Since an SSE connection is persistent, a new or updated SW
// cannot become active until the existing SSE connection is closed.
// We have to exclude sse.annualmovies.com to allow the new SW to activate immediately!
// This must be placed before calling serwist.addEventListeners()
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.hostname === 'sse.annualmovies.com') {
    event.stopImmediatePropagation()
  }
})

// add serwist listeners
serwist.addEventListeners()

// remove obsolete workbox caches (next-pwa legacy)
// leave this code until 01.01.2027
self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    // clean Cache Storage
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) =>
            cacheName.includes('workbox-precache') ||
            cacheName.includes('next-data') ||
            cacheName.includes('next-pwa')
          )
          .map((cacheName) => {
            console.log(`Deleting old cache: ${cacheName}`)
            return caches.delete(cacheName)
          })
      )
    }),

    // clean IndexedDB
    new Promise((resolve) => {
      const request = indexedDB.deleteDatabase('workbox-expiration')
      request.onerror = resolve
      request.onblocked = resolve
      request.onsuccess = resolve
    })
  ]))
})
