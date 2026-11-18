import { combineReducers } from '@reduxjs/toolkit'
import { preferencesReducer } from './slices/preferencesSlice'
import { sessionReducer } from './slices/sessionSlice'
import { transactionsReducer } from './slices/transactionsSlice'

export const rootReducer = combineReducers({
  transactions: transactionsReducer,
  session: sessionReducer,
  preferences: preferencesReducer,
})

export type RootState = ReturnType<typeof rootReducer>
