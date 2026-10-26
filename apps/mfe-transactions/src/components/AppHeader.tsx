'use client'

import { useCallback } from 'react'
import { Header } from '@bytebank/ui'
import { useAuth } from '@bytebank/shared'

export default function AppHeader() {
  const { user, logout } = useAuth()

  const handleLogout = useCallback(() => {
    void logout().then(() => window.location.assign('/auth'))
  }, [logout])

  return <Header userName={user?.name} onLogout={handleLogout} />
}
