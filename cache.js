import { CacheFirst, NetworkOnly } from 'serwist'

const runtimeCaching = [
  // do not handle
  {
    matcher: /\/noprecache\/.*/,
    handler: new NetworkOnly()
  },

  // previews
  {
    matcher: /https:\/\/img\.annualmovies\.com\/.+_400\.jpeg$/i,
    handler: new CacheFirst({
      cacheName: 'posters-preview-v1',
      fetchOptions: {
        mode: 'cors'
      }
    }),
    options: {
      expiration: {
        maxEntries: 512,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
      }
    }
  },

  // posters
  {
    matcher: /https:\/\/img\.annualmovies\.com\/.+_1185\.jpeg$/i,
    handler: new CacheFirst({
      cacheName: 'posters-full-v1',
      fetchOptions: {
        mode: 'cors'
      }
    }),
    options: {
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 14 * 24 * 60 * 60 // 14 days
      }
    }
  },

  // to handle requests to getServerSideProps
  {
    matcher: /\/_next\/data\/.+\/.+\.json(?:\?.+)?$/i,
    handler: async ({ request, url, event }) => {
      const emptyJson = { pageProps: {}, __N_SSP: true, manual: true }
      const emptyBlob = new Blob([JSON.stringify(emptyJson)], { type: 'application/json' })
      const emptyOptions = {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
      return new Response(emptyBlob, emptyOptions)
    }
  },

  // // to support Single Page Application (loading index page for all urls)
  // // commented in favor of navigateFallback in next.config.js (when used next-pwa)
  // {
  //   urlPattern: ({ url }) => {
  //     if (self.origin !== url.origin) {
  //       return false
  //     }
  //     if (url.pathname.startsWith('/api/')) {
  //       return false
  //     }
  //     return true
  //   },
  //   handler: 'CacheOnly',
  //   options: {
  //     cacheName: 'spa-redirector',
  //     precacheFallback: {
  //       fallbackURL: '/'
  //     }
  //   }
  // },

  ...[]
]

export default runtimeCaching
