// noinspection RedundantIfStatementJS

// original is from @next-pwa/cache.js
const runtimeCaching = [
  {
    urlPattern: /https:\/\/img\.annualmovies\.com\/.+_400\.jpeg$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'posters-preview-v1',
      fetchOptions: {
        mode: 'cors' // CacheFirst works only with cors
      },
      expiration: {
        maxEntries: 512,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
      }
    }
  },

  {
    urlPattern: /https:\/\/img\.annualmovies\.com\/.+_1185\.jpeg$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'posters-full-v1',
      fetchOptions: {
        mode: 'cors' // CacheFirst works only with cors
      },
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 14 * 24 * 60 * 60 // 14 days
      }
    }
  },

  // to handle requests to getServerSideProps
  {
    urlPattern: /\/_next\/data\/.+\/.+\.json(?:\?.+)?$/i,
    handler: async function () {
      // shall I add X-Nextjs-Matched-Path: '/' or /[...slug] ?... as NextJS does
      const emptyJson = { pageProps: {}, __N_SSP: true }
      const emptyBlob = new Blob([JSON.stringify(emptyJson)], { type: 'application/json' })
      const emptyOptions = { status: 200, headers: {} }
      return new Response(emptyBlob, emptyOptions)
    }
  },

  // // to support Single Page Application (loading index page for all urls)
  // // commented in favor of navigateFallback in next.config.js
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
