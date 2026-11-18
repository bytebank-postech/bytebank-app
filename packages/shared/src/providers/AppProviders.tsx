'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StoreProvider } from '../store/StoreProvider'
import { SessionBootstrap } from './SessionBootstrap'
import type { RootState } from '../store/rootReducer'
import type { AppExtra } from '../store/types'

type AppProvidersProps = {
  children: ReactNode
  extra?: AppExtra
  preloadedState?: Partial<RootState>
}

export function AppProviders({
  children,
  extra,
  preloadedState,
}: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider extra={extra} preloadedState={preloadedState}>
        <SessionBootstrap>{children}</SessionBootstrap>
      </StoreProvider>
    </QueryClientProvider>
  )
}
