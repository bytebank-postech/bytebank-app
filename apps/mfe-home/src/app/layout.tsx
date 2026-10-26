import type { Metadata } from 'next'
import './globals.scss'
import { AppProviders, AuthGuard } from '@bytebank/shared'
import AppHeader from '../components/AppHeader'

export const metadata: Metadata = {
  title: 'ByteBank',
  description: 'Gerenciamento financeiro',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProviders>
          <AuthGuard>
            <AppHeader />
            {children}
          </AuthGuard>
        </AppProviders>
      </body>
    </html>
  )
}
