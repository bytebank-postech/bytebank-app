import type { Metadata } from 'next'
import './globals.scss'
import { Header as AppHeader } from '@bytebank/ui'

export const metadata: Metadata = {
  title: 'ByteBank — Dashboard',
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
        <AppHeader />
        {children}
      </body>
    </html>
  )
}
