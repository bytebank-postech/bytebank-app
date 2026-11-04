import { isAnyOf } from '@reduxjs/toolkit'
import { signIn, signOut, signUp } from '../slices/sessionSlice'
import { resetTransactions } from '../slices/transactionsSlice'
import { clearTransactionNavigationCache } from '../../cache/transactionNavigationCache'
import type { AppStartListening } from './createAppListenerMiddleware'

export function registerSessionListeners(startListening: AppStartListening) {
  startListening({
    matcher: isAnyOf(signOut.pending, signIn.fulfilled, signUp.fulfilled),
    effect: (_action, listenerApi) => {
      clearTransactionNavigationCache()
      listenerApi.extra?.queryClient?.clear()
      listenerApi.dispatch(resetTransactions())
    },
  })
}
