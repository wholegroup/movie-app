import { Serwist } from 'serwist'
import { defaultCache } from '@serwist/next/worker'
import runtimeCaching from './sw_cache.js'

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    navigateFallback: '/',
    navigateFallbackDenylist: [
      /api\/.*/,
      /auth\/.*/,
      /noprecache\/.*/
    ],
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
