'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { FullScreenDiv, Loader } from '@bytebank/ui'

type User = {
  id: string
  name: string
  email: string
} | null

type AuthContextType = {
  user: User
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const AUTH_API_URL = '/auth/api/login'
const LOGOUT_API_URL = '/auth/api/logout'
const SESSION_API_URL = '/auth/api/session'

async function authenticate(email: string, password: string) {
  const response = await fetch(AUTH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error ?? 'Falha na autenticação')
  }

  return data
}

async function logoutUser() {
  try {
    await fetch(LOGOUT_API_URL, {
      method: 'POST',
      cache: 'no-store',
    })
  } catch {
    console.error('Erro ao fazer logout no servidor')
  }
}

async function getSession(): Promise<User> {
  const response = await fetch(SESSION_API_URL, { cache: 'no-store' })
  if (!response.ok) return null
  const data = await response.json()
  return data.user ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getSession()
      .then((sessionUser) => {
        if (!cancelled) setUser(sessionUser)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { user } = await authenticate(email, password)

      setUser(user)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Usuário ou senha inválidos'
      setError(message)
      setUser(null)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    await logoutUser()
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      error,
      login,
      logout,
    }),
    [user, loading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) {
      return
    }

    if (!isAuthenticated && pathname !== '/auth') {
      window.location.assign('/auth')
    }

    if (isAuthenticated && pathname === '/auth') {
      window.location.assign('/')
    }
  }, [isAuthenticated, loading, pathname])

  if (loading || !isAuthenticated) {
    return (
      <FullScreenDiv>
        <Loader />
      </FullScreenDiv>
    )
  }

  return <>{children}</>
}
