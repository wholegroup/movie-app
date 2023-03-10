/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack (webpackConfig) {
    return {
      ...webpackConfig,
      // disable minification
      optimization: {
        minimize: false
      }
    }
  }
}

const runtimeCaching = require('./cache')
const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching,
  dynamicStartUrl: false, // if enabled the app fetches index page every time
  reloadOnOnline: false, //
  mode: 'development' // don't minified sw
  // https://github.com/shadowwalker/next-pwa/tree/master/examples/custom-worker
  // https://www.proximity.blog/post/building-a-next-js-pwa-using-nextpwa-and-service-worker-2022330
  // swSrc: 'service-worker.js',
})

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(withPWA(nextConfig))
