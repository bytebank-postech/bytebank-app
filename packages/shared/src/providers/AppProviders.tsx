'use client'

import type { ReactNode } from 'react'
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
  return (
    <StoreProvider extra={extra} preloadedState={preloadedState}>
      <SessionBootstrap>{children}</SessionBootstrap>
    </StoreProvider>
  )
}
