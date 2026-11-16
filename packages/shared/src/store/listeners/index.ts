import {
  createAppListenerMiddleware,
  type AppListenerMiddleware,
} from './createAppListenerMiddleware'
import { registerPreferencesListeners } from './preferencesListeners'
import { registerSessionListeners } from './sessionListeners'
import { registerTransactionsListeners } from './transactionsListeners'
import type { AppExtra } from '../types'

export function createRegisteredListenerMiddleware(
  extra?: AppExtra
): AppListenerMiddleware {
  const listenerMiddleware = createAppListenerMiddleware(extra)

  registerTransactionsListeners(listenerMiddleware.startListening)
  registerSessionListeners(listenerMiddleware.startListening)
  registerPreferencesListeners(listenerMiddleware.startListening)

  return listenerMiddleware
}

export { readStoredPreferences } from './preferencesListeners'
export { SEARCH_DEBOUNCE_MS } from './transactionsListeners'
export type {
  AppListenerMiddleware,
  AppStartListening,
} from './createAppListenerMiddleware'
