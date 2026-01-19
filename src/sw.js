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

          console.log('Cleaning up the index/app page...')
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
    ...defaultCache
  ]
})

serwist.addEventListeners()
