import { isAnyOf } from '@reduxjs/toolkit'
import { selectCollectionView } from '../selectors/transactionsSelectors'
import {
  clearFilters,
  createTransaction,
  deleteTransactions,
  loadTransactionPage,
  setMonth,
  setPage,
  setPageSize,
  setSearch,
  setType,
} from '../slices/transactionsSlice'
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
      if (selectCollectionView(listenerApi.getState()) !== 'page') return

      listenerApi.cancelActiveListeners()
      await listenerApi.dispatch(loadTransactionPage())
    },
  })
}
