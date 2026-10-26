import { createSelector } from '@reduxjs/toolkit'
import {
  buildMonthlyFlow,
  buildTypeDistribution,
  groupTransactionsByMonth,
  previewMonthGroups,
  totalBalance,
  type Transaction,
} from '@bytebank/domain'
import type { RootState } from '../rootReducer'
import {
  initialTransactionFilters,
  transactionsAdapter,
} from '../slices/transactionsSlice'

export const STATEMENT_PREVIEW_SIZE = 5

const selectTransactionsSlice = (state: RootState) => state.transactions

export const { selectEntities: selectTransactionEntities } =
  transactionsAdapter.getSelectors(selectTransactionsSlice)

export const selectVisibleIds = (state: RootState) =>
  state.transactions.visibleIds

export const selectVisibleTransactions = createSelector(
  [selectTransactionEntities, selectVisibleIds],
  (entities, ids) =>
    ids.reduce<Transaction[]>((items, id) => {
      const transaction = entities[id]
      if (transaction) items.push(transaction)

      return items
    }, [])
)

export const selectSearchTerm = (state: RootState) =>
  state.transactions.filters.search
export const selectTypeFilter = (state: RootState) =>
  state.transactions.filters.type
export const selectMonthFilter = (state: RootState) =>
  state.transactions.filters.month
export const selectCurrentPage = (state: RootState) =>
  state.transactions.filters.page
export const selectPageSize = (state: RootState) =>
  state.transactions.filters.pageSize

export const selectTotalItems = (state: RootState) => state.transactions.total
export const selectTotalPages = (state: RootState) =>
  state.transactions.totalPages
export const selectCollectionView = (state: RootState) =>
  state.transactions.view

export const selectListStatus = (state: RootState) =>
  state.transactions.list.status
export const selectListError = (state: RootState) =>
  state.transactions.list.error

export const selectMutationError = (state: RootState) =>
  state.transactions.mutation.error
export const selectIsMutating = (state: RootState) =>
  state.transactions.mutation.status === 'loading'

export const selectHasActiveFilters = createSelector(
  [selectSearchTerm, selectTypeFilter, selectMonthFilter],
  (search, type, month) =>
    search !== initialTransactionFilters.search ||
    type !== initialTransactionFilters.type ||
    month !== initialTransactionFilters.month
)

export const selectVisibleMonthGroups = createSelector(
  [selectVisibleTransactions],
  groupTransactionsByMonth
)

export const selectStatementPreview = createSelector(
  [selectVisibleTransactions],
  (transactions) => previewMonthGroups(transactions, STATEMENT_PREVIEW_SIZE)
)

export const selectBalance = createSelector(
  [selectVisibleTransactions],
  totalBalance
)

export const selectMonthlyFlow = createSelector(
  [selectVisibleTransactions],
  buildMonthlyFlow
)

export const selectTypeDistribution = createSelector(
  [selectVisibleTransactions],
  buildTypeDistribution
)
