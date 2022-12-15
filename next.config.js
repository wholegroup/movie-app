/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  // https://www.proximity.blog/post/building-a-next-js-pwa-using-nextpwa-and-service-worker-2022330
  // swSrc: 'service-worker.js',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = withPWA(nextConfig)
