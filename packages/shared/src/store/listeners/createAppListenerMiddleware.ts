import { createListenerMiddleware } from '@reduxjs/toolkit'
import type { RootState } from '../rootReducer'
import type { AppDispatch, AppExtra } from '../types'

export function createAppListenerMiddleware(extra?: AppExtra) {
  return createListenerMiddleware<RootState, AppDispatch, AppExtra>({ extra })
}

export type AppListenerMiddleware = ReturnType<
  typeof createAppListenerMiddleware
>

export type AppStartListening = AppListenerMiddleware['startListening']
