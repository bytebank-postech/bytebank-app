'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '@bytebank/ui/core'
import { useAuth } from '@bytebank/shared'

export default function AppHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const handleLogout = useCallback(() => {
    void logout().then(() => window.location.assign('/auth'))
  }, [logout])

  return (
    <Header
      userName={user?.name}
      onLogout={handleLogout}
      currentPath={pathname}
    />
  )
}
