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
  const resolvedExtra = extra ?? createAppExtra()
  const listenerMiddleware = createRegisteredListenerMiddleware(resolvedExtra)

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: resolvedExtra },
        serializableCheck: { ignoredActionPaths: ['meta.arg.files'] },
      }).prepend(listenerMiddleware.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
