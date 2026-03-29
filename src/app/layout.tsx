import type { Metadata } from 'next'
import './globals.scss'

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
      <body>{children}</body>
    </html>
  )
}
