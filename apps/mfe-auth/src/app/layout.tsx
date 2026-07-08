import type { Metadata } from 'next'
import './globals.scss'
import { Header as AppHeader } from '@bytebank/ui'

export const metadata: Metadata = {
  title: 'ByteBank – Autenticação',
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
        <AppHeader />
        {children}
      </body>
    </html>
  )
}
