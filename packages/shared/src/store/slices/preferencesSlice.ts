import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type PreferencesState = {
  balanceVisible: boolean
  hydrated: boolean
}

const initialState: PreferencesState = {
  balanceVisible: true,
  hydrated: false,
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    hydratePreferences(
      state,
      action: PayloadAction<Partial<Omit<PreferencesState, 'hydrated'>>>
    ) {
      state.balanceVisible = action.payload.balanceVisible ?? true
      state.hydrated = true
    },
    toggleBalanceVisible(state) {
      state.balanceVisible = !state.balanceVisible
    },
  },
})

export const { hydratePreferences, toggleBalanceVisible } =
  preferencesSlice.actions

export const preferencesReducer = preferencesSlice.reducer
