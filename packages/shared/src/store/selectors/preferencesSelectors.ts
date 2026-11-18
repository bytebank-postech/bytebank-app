import type { RootState } from '../rootReducer'

export const selectBalanceVisible = (state: RootState) =>
  state.preferences.balanceVisible

export const selectPreferencesHydrated = (state: RootState) =>
  state.preferences.hydrated
