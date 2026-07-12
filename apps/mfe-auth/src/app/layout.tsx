import type { Metadata } from 'next'
import './globals.scss'
import { Header as AppHeader } from '@bytebank/ui'
import { AuthProvider } from '@bytebank/shared'

export const metadata: Metadata = {
  title: 'ByteBank - Login',
  description: 'Área de autenticação do ByteBank',
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
          <AppHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
