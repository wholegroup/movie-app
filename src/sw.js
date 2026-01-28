import { Serwist } from 'serwist'
import { defaultCache } from '@serwist/next/worker'
import runtimeCaching from './sw_cache.js'
import { convertToEmpty } from './convertToEmpty.js'

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    navigateFallback: process.env.NODE_ENV !== 'development' ? '/' : undefined,
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

// push handler
self.addEventListener('push', /** @param {PushEvent} event */ (event) => {
  const data = (() => {
    const dataText = event.data ? event.data.text() : ''
    if (!dataText) {
      return {}
    }

    try {
      const dataJson = JSON.parse(dataText)
      if (dataJson && typeof dataJson === 'object' && !Array.isArray(dataJson)) {
        return dataJson
      }
      // noinspection ExceptionCaughtLocallyJS
      throw new Error('JSON is not object: ' + dataText + '')
    } catch (ex) {
      console.error(ex)
    }

    return {
      body: dataText
    }
  })()

  const title = data.title || 'Annual Movies'
  const options = {
    body: data.body || 'New movies are available!',
    icon: '/icons/icon-32x32.png',
    data: data.data || {}
  }

  event.waitUntil((async () => {
    try {
      await self.registration.showNotification(title, options)
      console.log(`Notification ${title} sent.`)
    } catch (ex) {
      console.error(ex)
    }
  })())
})

// notification click handler
self.addEventListener('notificationclick', /** @param {NotificationEvent} event */ (event) => {
  event.notification.close()
  const url = event.notification?.data?.url || '/'
  event.waitUntil(self.clients.openWindow(url))
})

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
