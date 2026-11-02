import { isAnyOf } from '@reduxjs/toolkit'
import { selectCollectionView } from '../selectors/transactionsSelectors'
import {
  clearFilters,
  createTransaction,
  deleteTransactions,
  loadTransactionPage,
  removeTransactionAttachment,
  setMonth,
  setPage,
  setPageSize,
  setSearch,
  setType,
  updateTransaction,
} from '../slices/transactionsSlice'
import { transactionQueryKeys } from '../transactionQueryKeys'
import type { AppStartListening } from './createAppListenerMiddleware'

export const SEARCH_DEBOUNCE_MS = 350

const isFilterChange = isAnyOf(
  setSearch,
  setType,
  setMonth,
  setPage,
  setPageSize,
  clearFilters
)

const isCollectionInvalidated = isAnyOf(
  createTransaction.fulfilled,
  updateTransaction.fulfilled,
  deleteTransactions.fulfilled,
  deleteTransactions.rejected,
  removeTransactionAttachment.fulfilled
)

const shouldReloadPage = isAnyOf(
  createTransaction.fulfilled,
  deleteTransactions.fulfilled,
  deleteTransactions.rejected
)

export function registerTransactionsListeners(
  startListening: AppStartListening
) {
  startListening({
    matcher: isFilterChange,
    effect: async (action, listenerApi) => {
      listenerApi.cancelActiveListeners()

      if (setSearch.match(action)) {
        await listenerApi.delay(SEARCH_DEBOUNCE_MS)
      }

      if (selectCollectionView(listenerApi.getState()) !== 'page') return

      await listenerApi.dispatch(loadTransactionPage())
    },
  })

  startListening({
    matcher: isCollectionInvalidated,
    effect: async (_action, listenerApi) => {
      const userId = listenerApi.getState().session.user?.id ?? 'anonymous'
      await listenerApi.extra?.queryClient?.invalidateQueries({
        queryKey: transactionQueryKeys.forUser(userId),
      })

      if (!shouldReloadPage(_action)) return
      if (selectCollectionView(listenerApi.getState()) !== 'page') return

      listenerApi.cancelActiveListeners()
      await listenerApi.dispatch(loadTransactionPage())
    },
  })
}
