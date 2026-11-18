import type { Metadata } from 'next'
import './globals.scss'
import { AppProviders } from '@bytebank/shared'

export const metadata: Metadata = {
  title: 'ByteBank - Autenticação',
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
