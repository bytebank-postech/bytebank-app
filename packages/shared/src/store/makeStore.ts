import { configureStore } from '@reduxjs/toolkit'
import { createAppExtra } from './createAppExtra'
import { createRegisteredListenerMiddleware } from './listeners'
import { rootReducer, type RootState } from './rootReducer'
import type { AppExtra } from './types'

export type MakeStoreOptions = {
  extra?: AppExtra
  preloadedState?: Partial<RootState>
}

export function makeStore({ extra, preloadedState }: MakeStoreOptions = {}) {
  const listenerMiddleware = createRegisteredListenerMiddleware()

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: extra ?? createAppExtra() },
        serializableCheck: { ignoredActionPaths: ['meta.arg.files'] },
      }).prepend(listenerMiddleware.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
