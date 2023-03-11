// noinspection RedundantIfStatementJS

// original is from @next-pwa/cache.js
const runtimeCaching = [
  // to support Single Page Application (loading index page for all urls)
  {
    urlPattern: ({ url }) => {
      if (self.origin !== url.origin) {
        return false
      }
      if (url.pathname.startsWith('/api/')) {
        return false
      }
      return true
    },
    handler: 'CacheOnly',
    options: {
      cacheName: 'spa-redirector',
      precacheFallback: {
        fallbackURL: '/'
      }
    }
  }
]

export default runtimeCaching
