import withSerwistInit from '@serwist/next'
import nextBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack (webpackConfig) {
    return {
      ...webpackConfig,
      // // disable minification
      // optimization: {
      //   minimize: false
      // },
      ...{}
    }
  },
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
    '!(noprecache)/**',
  ]
})

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

export default withBundleAnalyzer(withSerwist(nextConfig))
