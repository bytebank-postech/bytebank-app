import path from 'node:path'
import type { NextConfig } from 'next'
import { securityHeaders } from '../../security-headers'

const nextConfig: NextConfig = {
  output: 'standalone',
  assetPrefix: '/home-assets',
  transpilePackages: [
    '@bytebank/ui',
    '@bytebank/shared',
    '@bytebank/domain',
    '@bytebank/application',
    '@bytebank/infrastructure',
  ],
  sassOptions: {
    loadPaths: [path.resolve(__dirname, '../../packages/ui/src/styles')],
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
