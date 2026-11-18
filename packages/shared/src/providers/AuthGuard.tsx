'use client'

import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAppSelector } from '../store/hooks'
import {
  selectIsAuthenticated,
  selectIsSessionLoading,
} from '../store/selectors/sessionSelectors'

const SPIN_KEYFRAMES =
  '@keyframes bytebank-auth-spin { to { transform: rotate(360deg); } }'

const backdropStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: '#f5f5f5',
}

const spinnerStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: '3px solid #d0d0d0',
  borderTopColor: '#004d61',
  animation: 'bytebank-auth-spin 0.8s linear infinite',
}

function isAuthPublicPath(pathname: string) {
  return pathname === '/auth' || pathname.startsWith('/auth/')
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const loading = useAppSelector(selectIsSessionLoading)
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated && !isAuthPublicPath(pathname)) {
      window.location.assign('/auth')
    }

    if (isAuthenticated && isAuthPublicPath(pathname)) {
      window.location.assign('/')
    }
  }, [isAuthenticated, loading, pathname])

  if (loading || !isAuthenticated) {
    return (
      <div style={backdropStyle}>
        <div aria-label="Carregando" role="status" style={spinnerStyle} />
        <style>{SPIN_KEYFRAMES}</style>
      </div>
    )
  }

  return <>{children}</>
}
