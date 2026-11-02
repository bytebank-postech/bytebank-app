'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { useAppDispatch } from './hooks'
import { readStoredPreferences } from './listeners'
import { makeStore } from './makeStore'
import { createAppExtra } from './createAppExtra'
import { hydratePreferences } from './slices/preferencesSlice'
import type { RootState } from './rootReducer'
import type { AppExtra } from './types'

type StoreProviderProps = {
  children: ReactNode
  extra?: AppExtra
  preloadedState?: Partial<RootState>
}

function PreferencesHydrator() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(hydratePreferences(readStoredPreferences()))
  }, [dispatch])

  return null
}

export function StoreProvider({
  children,
  extra,
  preloadedState,
}: StoreProviderProps) {
  const queryClient = useQueryClient()
  const [store] = useState(() =>
    makeStore({
      extra: createAppExtra({ ...extra, queryClient }),
      preloadedState,
    })
  )

  return (
    <Provider store={store}>
      <PreferencesHydrator />
      {children}
    </Provider>
  )
}
