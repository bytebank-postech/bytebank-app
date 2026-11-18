import {
  toggleBalanceVisible,
  type PreferencesState,
} from '../slices/preferencesSlice'
import type { AppStartListening } from './createAppListenerMiddleware'

const STORAGE_KEY = 'bytebank:preferences'

type StoredPreferences = Partial<Omit<PreferencesState, 'hydrated'>>

export function readStoredPreferences(): StoredPreferences {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as StoredPreferences

    return typeof parsed.balanceVisible === 'boolean'
      ? { balanceVisible: parsed.balanceVisible }
      : {}
  } catch {
    return {}
  }
}

export function registerPreferencesListeners(startListening: AppStartListening) {
  startListening({
    actionCreator: toggleBalanceVisible,
    effect: (_action, listenerApi) => {
      if (typeof window === 'undefined') return

      const { balanceVisible } = listenerApi.getState().preferences

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ balanceVisible })
        )
      } catch {
        return
      }
    },
  })
}
