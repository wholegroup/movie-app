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
    /noprecache\/.*/
  ],
  dynamicStartUrl: false, // if enabled the app fetches index page every time
  reloadOnOnline: false,
  disableDevLogs: true,
  disable: process.env.NODE_ENV === 'development', // temporary disable to suppress logs

  // I have bad-precaching-response of dynamic-css-manifest.json in next.js v15
  // Probably because of next-pwa is outdated I have to exclude additional file in building precached file list
  // https://github.com/serwist/serwist/discussions/228#discussioncomment-11864263
  exclude: [
    // https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1332258575
    ({ asset }) => {
      // Add here any file that fails pre-caching
      const excludeList = [
        // Default Serwist https://serwist.pages.dev/docs/next/configuring/exclude
        /\.map$/,
        /^manifest.*\.js$/,
        /^server\//,
        /^(((app-)?build-manifest|react-loadable-manifest|dynamic-css-manifest)\.json)$/
      ]
      return excludeList.some(r => r.test(asset.name))
    }
  ],

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
