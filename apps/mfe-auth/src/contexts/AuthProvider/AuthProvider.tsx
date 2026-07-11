'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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

const AUTH_API_URL = '/api/login'

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

  return data.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored =
      typeof window !== 'undefined'
        ? localStorage.getItem('bytebank-auth')
        : null

    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('bytebank-auth')
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authenticate(email, password)

      const loggedUser = {
        id: data.id ?? '1',
        name: data.name ?? 'Usuário ByteBank',
        email: data.email ?? email,
      }

      setUser(loggedUser)
      localStorage.setItem('bytebank-auth', JSON.stringify(loggedUser))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao autenticar'
      setError(message)
      setUser(null)
      localStorage.removeItem('bytebank-auth')
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('bytebank-auth')
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
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && pathname !== '/auth') {
        router.push('/auth')
      }

      if (isAuthenticated && pathname === '/auth') {
        router.push('/')
      }
    }
  }, [isAuthenticated, loading, pathname, router])

  if (loading || !isAuthenticated) {
    return (
      <FullScreenDiv>
        <Loader />
      </FullScreenDiv>
    )
  }

  return <>{children}</>
}
