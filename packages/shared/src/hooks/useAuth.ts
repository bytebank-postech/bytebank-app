'use client'

import { useCallback, useMemo } from 'react'
import type { AuthUser } from '@bytebank/domain'
import { toError } from '../utils/toError'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { signIn, signOut, signUp } from '../store/slices/sessionSlice'
import {
  selectIsAuthenticated,
  selectIsSessionLoading,
  selectSessionError,
  selectSessionUser,
} from '../store/selectors/sessionSelectors'

export type AuthValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): AuthValue {
  const dispatch = useAppDispatch()

  const user = useAppSelector(selectSessionUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const loading = useAppSelector(selectIsSessionLoading)
  const error = useAppSelector(selectSessionError)

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await dispatch(signIn({ email, password })).unwrap()
      } catch (reason) {
        throw toError(reason, 'Falha ao entrar.')
      }
    },
    [dispatch]
  )

  const register = useCallback(
    async (email: string, password: string) => {
      try {
        await dispatch(signUp({ email, password })).unwrap()
      } catch (reason) {
        throw toError(reason, 'Falha ao criar conta.')
      }
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await dispatch(signOut())
  }, [dispatch])

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      error,
      login,
      register,
      logout,
    }),
    [user, isAuthenticated, loading, error, login, register, logout]
  )
}
