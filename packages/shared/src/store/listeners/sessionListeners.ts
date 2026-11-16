import { isAnyOf, isRejected } from '@reduxjs/toolkit'
import {
  sessionExpired,
  signIn,
  signOut,
  signUp,
} from '../slices/sessionSlice'
import {
  createTransaction,
  deleteTransactions,
  loadAllTransactions,
  loadTransactionPage,
  removeTransactionAttachment,
  resetTransactions,
  updateTransaction,
} from '../slices/transactionsSlice'
import { selectIsAuthenticated } from '../selectors/sessionSelectors'
import { clearTransactionNavigationCache } from '../../cache/transactionNavigationCache'
import type { AppStartListening } from './createAppListenerMiddleware'

const isTransactionRequestRejected = isRejected(
  loadTransactionPage,
  loadAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransactions,
  removeTransactionAttachment
)

export function registerSessionListeners(startListening: AppStartListening) {
  startListening({
    matcher: isAnyOf(
      signOut.pending,
      signIn.fulfilled,
      signUp.fulfilled,
      sessionExpired
    ),
    effect: (_action, listenerApi) => {
      clearTransactionNavigationCache()
      listenerApi.extra?.queryClient?.clear()
      listenerApi.dispatch(resetTransactions())
    },
  })

  // Uma falha de API pode ser só rede ou validação; a sessão é reconsultada
  // para decidir se o usuário precisa entrar de novo.
  startListening({
    matcher: isTransactionRequestRejected,
    effect: async (action, listenerApi) => {
      if (action.meta.aborted) return
      if (!selectIsAuthenticated(listenerApi.getState())) return

      listenerApi.cancelActiveListeners()

      const user = await listenerApi.pause(
        listenerApi.extra.session.getSession().catch(() => undefined)
      )
      if (user !== null) return
      if (!selectIsAuthenticated(listenerApi.getState())) return

      listenerApi.dispatch(sessionExpired())
    },
  })
}
