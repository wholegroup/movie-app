import withSerwistInit from '@serwist/next'
import nextBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone'
}

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.js',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development', // temporary disable to suppress logs
  reloadOnOnline: false,
  // as a default value is `**/*` we have to redefine this array to exclude `noprecache` (next-pwa legacy)
  globPublicPatterns: [
    '!(noprecache)',
    '!(noprecache)/**'
  ],
  // precache index page (react app) inserted to self.__SW_MANIFEST
  manifestTransforms: [
    async (manifestEntries) => {
      manifestEntries.push({
        url: '/',
        // Update the index page (randomized revision) on every build
        // because linked resources (CSS, pages) may change, and
        // an old precached index page may load obsolete versions.
        revision: crypto.randomUUID(),
        size: 1024 // any value only for validation
      })

      return { manifest: manifestEntries, warnings: [] }
    }
  ]
})

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

export default withBundleAnalyzer(withSerwist(nextConfig))
