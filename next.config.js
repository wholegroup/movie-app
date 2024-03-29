import nextPWA from 'next-pwa'
import nextBundleAnalyzer from '@next/bundle-analyzer'
import runtimeCaching from './cache.js'

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

const withPWA = nextPWA({
  dest: 'public',
  runtimeCaching,
  navigateFallback: '/',
  navigateFallbackDenylist: [
    /api\/.*/,
    /noprecache\/.*/,
  ],
  dynamicStartUrl: false, // if enabled the app fetches index page every time
  reloadOnOnline: false,
  disableDevLogs: true,
  disable: process.env.NODE_ENV === 'development', // temporary disable to suppress logs

  // mode: 'development', // don't minified SW
  // https://github.com/shadowwalker/next-pwa/tree/master/examples/custom-worker
  // https://www.proximity.blog/post/building-a-next-js-pwa-using-nextpwa-and-service-worker-2022330
  // swSrc: 'service-worker.js',
  ...{}
})

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

export default withBundleAnalyzer(withPWA(nextConfig))
