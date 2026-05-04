/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8001',
    NEXT_PUBLIC_CHAT_URL: process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
