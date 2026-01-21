import { CacheFirst, ExpirationPlugin, NetworkOnly } from 'serwist'

const runtimeCaching = [
  // do not handle/cache `noprecache` requests
  {
    matcher: /\/noprecache\/.*/,
    handler: new NetworkOnly()
  },

  // previews
  {
    matcher: /https:\/\/img\.annualmovies\.com\/.+_400\.jpeg$/i,
    handler: new CacheFirst({
      cacheName: 'posters-preview-v1',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 512,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        })
      ],
      fetchOptions: {
        mode: 'cors'
      }
    }),
    options: {
      cacheableResponse: {
        statuses: [200]
      }
    }
  },

  // posters
  {
    matcher: /https:\/\/img\.annualmovies\.com\/.+_1185\.jpeg$/i,
    handler: new CacheFirst({
      cacheName: 'posters-full-v1',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 14 * 24 * 60 * 60 // 14 days
        })
      ],
      fetchOptions: {
        mode: 'cors'
      }
    }),
    options: {
      cacheableResponse: {
        statuses: [200]
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

  ...[]
]

export default runtimeCaching
