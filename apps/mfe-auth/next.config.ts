import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  assetPrefix: '/auth-assets',
  transpilePackages: ['@bytebank/ui', '@bytebank/shared'],
  sassOptions: {
    loadPaths: [
      path.resolve(__dirname, '../../packages/ui/src/styles'),
    ],
  },
}

export default nextConfig
