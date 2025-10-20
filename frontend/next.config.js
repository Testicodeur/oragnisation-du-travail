/***** @type {import('next').NextConfig} *****/
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Réactivé pour Netlify
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  },
}
module.exports = nextConfig
