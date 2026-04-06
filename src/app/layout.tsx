import type { Metadata } from 'next'
import './globals.scss'
import { Inter } from 'next/font/google'
import AppHeader from '../components/layout/header/header'
const inter = Inter({ subsets: ['latin'] })
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
    <html lang="pt-BR" className={inter.className}>
      <body>
        <AppHeader></AppHeader>
        {children}
      </body>
    </html>
  )
}
