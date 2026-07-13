import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  getTransactionPage,
  type TransactionPage,
  type TransactionPageFilters,
} from '../services/transactions'
import type { Transaction, TransactionType } from '../types/transaction'

export type TransactionFilters = {
  search: string
  type: TransactionType | 'Todos'
  month: string | 'Todos'
  page: number
  pageSize: number
}

type TransactionsState = {
  items: Transaction[]
  total: number
  totalPages: number
  status: 'idle' | 'loading' | 'error'
  error: string | null
  filters: TransactionFilters
}

const initialState: TransactionsState = {
  items: [],
  total: 0,
  totalPages: 1,
  status: 'idle',
  error: null,
  filters: { search: '', type: 'Todos', month: 'Todos', page: 1, pageSize: 10 },
}

function toRequest(filters: TransactionFilters): TransactionPageFilters {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search || undefined,
    type: filters.type === 'Todos' ? undefined : filters.type,
    month: filters.month === 'Todos' ? undefined : filters.month,
  }
}

export const loadTransactions = createAsyncThunk<TransactionPage, TransactionFilters>(
  'transactions/load',
  (filters) => getTransactionPage(toRequest(filters))
)

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload
      state.filters.page = 1
    },
    setType(state, action: PayloadAction<TransactionType | 'Todos'>) {
      state.filters.type = action.payload
      state.filters.page = 1
    },
    setMonth(state, action: PayloadAction<string | 'Todos'>) {
      state.filters.month = action.payload
      state.filters.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload
    },
    clearFilters(state) {
      state.filters = { ...initialState.filters }
    },
    removeTransactions(state, action: PayloadAction<string[]>) {
      state.items = state.items.filter((item) => !action.payload.includes(item.id))
      state.total = Math.max(0, state.total - action.payload.length)
    },
    replaceTransaction(state, action: PayloadAction<Transaction>) {
      state.items = state.items.map((item) =>
        item.id === action.payload.id ? action.payload : item
      )
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.total = action.payload.total
        state.totalPages = action.payload.totalPages
        state.filters.page = action.payload.page
        state.status = 'idle'
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.items = []
        state.status = 'error'
        state.error = action.error.message ?? 'Erro ao carregar as transações.'
      })
  },
})

export const {
  clearFilters,
  removeTransactions,
  replaceTransaction,
  setMonth,
  setPage,
  setSearch,
  setType,
} = transactionsSlice.actions
export default transactionsSlice.reducer
