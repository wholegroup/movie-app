// noinspection RedundantIfStatementJS

'use strict'

// original is from @next-pwa/cache.js
module.exports = [
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
