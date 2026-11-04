'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '@bytebank/ui'
import { useAuth, useTransactionNavigationPrefetch } from '@bytebank/shared'

export default function AppHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const prefetchTransactions = useTransactionNavigationPrefetch()

  const handleLogout = useCallback(() => {
    void logout().then(() => window.location.assign('/auth'))
  }, [logout])

  return (
    <Header
      userName={user?.name}
      onLogout={handleLogout}
      currentPath={pathname}
      onTransactionsIntent={prefetchTransactions}
    />
  )
}
