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
    return [
      // Estáticos e _next/static do mfe-home
      {
        source: '/home-assets/_next/:path*',
        destination: 'http://localhost:3001/home-assets/_next/:path*',
      },
      // Estáticos e _next/static do mfe-transactions
      {
        source: '/transactions-assets/_next/:path*',
        destination: 'http://localhost:3002/transactions-assets/_next/:path*',
      },
      // Estáticos e _next/static do mfe-auth
      {
        source: '/auth-assets/_next/:path*',
        destination: 'http://localhost:3003/auth-assets/_next/:path*',
      },
      // Rota de listagem de transações mapeia para o mfe-transactions
      {
        source: '/transactions',
        destination: 'http://localhost:3002/transactions',
      },
      {
        source: '/transactions/:path*',
        destination: 'http://localhost:3002/transactions/:path*',
      },
      // Rota de autenticação mapeia para o mfe-auth
      {
        source: '/auth',
        destination: 'http://localhost:3003/auth',
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3003/auth/:path*',
      },
      // Rota raiz e demais rotas padrões caem no mfe-home
      {
        source: '/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ]
  },
}

export default nextConfig
