import type { Metadata } from 'next'
import './globals.scss'
import AppHeader from '../components/layout/Header/Header'

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
        <AppHeader></AppHeader>
        {children}
      </body>
    </html>
  )
}
