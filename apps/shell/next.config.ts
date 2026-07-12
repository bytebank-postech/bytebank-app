import path from 'node:path'
import type { NextConfig } from 'next'

const mfeHomeUrl = process.env.MFE_HOME_URL ?? 'http://localhost:3001'
const mfeTransactionsUrl =
  process.env.MFE_TRANSACTIONS_URL ?? 'http://localhost:3002'
const mfeAuthUrl = process.env.MFE_AUTH_URL ?? 'http://localhost:3003'
const mfeDashboardUrl = process.env.MFE_DASHBOARD_URL ?? 'http://localhost:3004'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@bytebank/ui', '@bytebank/shared'],
  sassOptions: {
    loadPaths: [path.resolve(__dirname, '../../packages/ui/src/styles')],
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/home-assets/_next/:path*',
          destination: `${mfeHomeUrl}/home-assets/_next/:path*`,
        },
        {
          source: '/dashboard-assets/_next/:path*',
          destination: `${mfeDashboardUrl}/dashboard-assets/_next/:path*`,
        },
        {
          source: '/transactions-assets/_next/:path*',
          destination: `${mfeTransactionsUrl}/transactions-assets/_next/:path*`,
        },
        {
          source: '/auth-assets/_next/:path*',
          destination: `${mfeAuthUrl}/auth-assets/_next/:path*`,
        },
        {
          source: '/dashboard',
          destination: `${mfeDashboardUrl}/dashboard`,
        },
        {
          source: '/dashboard/:path*',
          destination: `${mfeDashboardUrl}/dashboard/:path*`,
        },
        {
          source: '/transactions',
          destination: `${mfeTransactionsUrl}/transactions`,
        },
        {
          source: '/transactions/:path*',
          destination: `${mfeTransactionsUrl}/transactions/:path*`,
        },
        {
          source: '/auth',
          destination: `${mfeAuthUrl}/auth`,
        },
        {
          source: '/auth/:path*',
          destination: `${mfeAuthUrl}/auth/:path*`,
        },
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
        {
          source: '/:path*',
          destination: `${mfeHomeUrl}/:path*`,
        },
      ],
      fallback: [],
    }
  },
}

export default nextConfig
