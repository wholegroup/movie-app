import { Serwist } from 'serwist'
import { defaultCache } from '@serwist/next/worker'
import runtimeCaching from './sw_cache.js'

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...runtimeCaching,
    ...defaultCache
  ],
  fallbacks: {
    entries: [
      {
        url: '/',
        matcher ({ request, url }) {
          if (request.mode !== 'navigate') {
            return false
          }
          const pathname = url.pathname
          if (
            pathname.startsWith('/api/') ||
            pathname.startsWith('/auth/') ||
            pathname.startsWith('/noprecache/')
          ) {
            return false
          }
          return true
        }
      }
    ]
  }
})

serwist.addEventListeners()
