import type { Metadata } from 'next'
import './globals.scss'
import { Header as AppHeader } from '@bytebank/ui'
import { AuthGuard, AuthProvider } from '@bytebank/shared'

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
        <AuthProvider>
          <AuthGuard>
            <AppHeader></AppHeader>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
