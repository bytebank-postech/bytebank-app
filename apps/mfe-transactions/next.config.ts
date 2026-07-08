import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/transactions',
  assetPrefix: '/transactions-assets',
  transpilePackages: ['@bytebank/ui', '@bytebank/shared'],
  sassOptions: {
    loadPaths: [
      path.resolve(__dirname, '../../packages/ui/src/styles'),
    ],
  },
}

export default nextConfig
