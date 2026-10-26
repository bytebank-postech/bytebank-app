import type { RootState } from '../rootReducer'

export const selectSessionUser = (state: RootState) => state.session.user
export const selectSessionStatus = (state: RootState) => state.session.status
export const selectSessionError = (state: RootState) => state.session.error

export const selectIsAuthenticated = (state: RootState) =>
  state.session.status === 'authenticated'

export const selectIsSessionLoading = (state: RootState) =>
  state.session.status === 'unknown' || state.session.status === 'loading'
