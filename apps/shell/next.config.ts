import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@bytebank/ui', '@bytebank/shared'],
  sassOptions: {
    loadPaths: [
      path.resolve(__dirname, '../../packages/ui/src/styles'),
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/home-assets/_next/:path*',
          destination: 'http://localhost:3001/home-assets/_next/:path*',
        },
        {
          source: '/transactions-assets/_next/:path*',
          destination: 'http://localhost:3002/transactions-assets/_next/:path*',
        },
        {
          source: '/auth-assets/_next/:path*',
          destination: 'http://localhost:3003/auth-assets/_next/:path*',
        },
        {
          source: '/transactions',
          destination: 'http://localhost:3002/transactions',
        },
        {
          source: '/transactions/:path*',
          destination: 'http://localhost:3002/transactions/:path*',
        },
        {
          source: '/auth',
          destination: 'http://localhost:3003/auth',
        },
        {
          source: '/auth/:path*',
          destination: 'http://localhost:3003/auth/:path*',
        },
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
        {
          source: '/:path*',
          destination: 'http://localhost:3001/:path*',
        },
      ],
      fallback: [],
    }
  },
}

export default nextConfig
