import {
  createEntityAdapter,
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
  type EntityState,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type {
  TransactionPage,
  TransactionPageFilters,
} from '@bytebank/application'
import type {
  Transaction,
  TransactionAttachment,
  TransactionType,
} from '@bytebank/domain'
import { createAppAsyncThunk, toErrorMessage } from '../createAppAsyncThunk'
import type { AppExtra, RequestStatus } from '../types'

export type TransactionCollectionView = 'page' | 'all'

export type TransactionFilters = {
  search: string
  type: TransactionType | 'Todos'
  month: string | 'Todos'
  page: number
  pageSize: number
}

type RemovalSnapshot = {
  transaction: Transaction
  index: number
}

type PendingRemoval = {
  items: RemovalSnapshot[]
  previousTotal: number
}

export type TransactionsState = EntityState<Transaction, string> & {
  visibleIds: string[]
  total: number
  totalPages: number
  view: TransactionCollectionView
  list: { status: RequestStatus; error: string | null; requestId: string | null }
  mutation: { status: RequestStatus; error: string | null }
  filters: TransactionFilters
  pendingRemovals: Record<string, PendingRemoval>
}

export const transactionsAdapter = createEntityAdapter<Transaction>()

export const initialTransactionFilters: TransactionFilters = {
  search: '',
  type: 'Todos',
  month: 'Todos',
  page: 1,
  pageSize: 10,
}

const initialState: TransactionsState = transactionsAdapter.getInitialState({
  visibleIds: [],
  total: 0,
  totalPages: 1,
  view: 'page',
  list: { status: 'idle', error: null, requestId: null },
  mutation: { status: 'idle', error: null },
  filters: initialTransactionFilters,
  pendingRemovals: {},
})

export function toPageFilters(
  filters: TransactionFilters
): TransactionPageFilters {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search.trim() || undefined,
    type: filters.type === 'Todos' ? undefined : filters.type,
    month: filters.month === 'Todos' ? undefined : filters.month,
  }
}

export const loadTransactionPage = createAppAsyncThunk<TransactionPage, void>(
  'transactions/loadPage',
  async (_arg, { extra, getState, rejectWithValue }) => {
    try {
      const filters = toPageFilters(getState().transactions.filters)

      return await extra.transactions.getTransactionPage.execute(filters)
    } catch (error) {
      return rejectWithValue(
        toErrorMessage(error, 'Erro ao carregar as transações.')
      )
    }
  }
)

export const loadAllTransactions = createAppAsyncThunk<Transaction[], void>(
  'transactions/loadAll',
  async (_arg, { extra, rejectWithValue }) => {
    try {
      return await extra.transactions.listTransactions.execute()
    } catch (error) {
      return rejectWithValue(
        toErrorMessage(error, 'Erro ao carregar as transações.')
      )
    }
  }
)

export type TransactionMutationResult = {
  transaction: Transaction
  attachmentError: string | null
}

// A transação e os anexos são duas chamadas independentes. Quando a segunda
// falha a primeira já está persistida, então o thunk resolve com a transação e
// reporta o anexo à parte — rejeitar descartaria um registro que existe.
async function attachFiles(
  extra: AppExtra,
  transaction: Transaction,
  files: File[]
): Promise<TransactionMutationResult> {
  if (files.length === 0) {
    return { transaction, attachmentError: null }
  }

  try {
    const uploads = await extra.toAttachmentUploads(files)
    const attachments =
      await extra.transactions.addTransactionAttachments.execute(
        transaction.id,
        uploads
      )

    return {
      transaction: {
        ...transaction,
        attachments: [...(transaction.attachments ?? []), ...attachments],
      },
      attachmentError: null,
    }
  } catch (error) {
    return {
      transaction,
      attachmentError: toErrorMessage(
        error,
        'A transação foi salva, mas os anexos não foram enviados.'
      ),
    }
  }
}

export type CreateTransactionInput = {
  data: Omit<Transaction, 'id'>
  files?: File[]
}

export const createTransaction = createAppAsyncThunk<
  TransactionMutationResult,
  CreateTransactionInput
>('transactions/create', async ({ data, files = [] }, { extra, rejectWithValue }) => {
  try {
    const created = await extra.transactions.createTransaction.execute(data)

    return await attachFiles(extra, created, files)
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, 'Não foi possível criar a transação.')
    )
  }
})

export type UpdateTransactionInput = {
  id: string
  data: Partial<Transaction>
  files?: File[]
}

export const updateTransaction = createAppAsyncThunk<
  TransactionMutationResult,
  UpdateTransactionInput
>('transactions/update', async ({ id, data, files = [] }, { extra, rejectWithValue }) => {
  try {
    const updated = await extra.transactions.updateTransaction.execute(id, data)

    return await attachFiles(extra, updated, files)
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, 'Não foi possível atualizar a transação.')
    )
  }
})

export const deleteTransactions = createAppAsyncThunk<string[], string[]>(
  'transactions/deleteMany',
  async (ids, { extra, rejectWithValue }) => {
    try {
      await Promise.all(
        ids.map((id) => extra.transactions.deleteTransaction.execute(id))
      )

      return ids
    } catch (error) {
      return rejectWithValue(
        toErrorMessage(error, 'Não foi possível excluir a(s) transação(ões).')
      )
    }
  }
)

export type RemoveAttachmentInput = {
  transactionId: string
  attachmentId: string
}

export const removeTransactionAttachment = createAppAsyncThunk<
  RemoveAttachmentInput,
  RemoveAttachmentInput
>('transactions/removeAttachment', async (input, { extra, rejectWithValue }) => {
  try {
    await extra.transactions.removeTransactionAttachment.execute(
      input.transactionId,
      input.attachmentId
    )

    return input
  } catch (error) {
    return rejectWithValue(
      toErrorMessage(error, 'Não foi possível remover o anexo.')
    )
  }
})

const mutationThunks = [
  createTransaction,
  updateTransaction,
  deleteTransactions,
  removeTransactionAttachment,
] as const

function insertVisible(state: TransactionsState, id: string, index: number) {
  if (state.visibleIds.includes(id)) return

  state.visibleIds.splice(Math.min(index, state.visibleIds.length), 0, id)
}

function isStaleListResponse(
  state: TransactionsState,
  meta: { requestId: string }
) {
  return state.list.requestId !== meta.requestId
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      if (state.filters.search === action.payload) return

      state.filters.search = action.payload
      state.filters.page = 1
    },
    setType(state, action: PayloadAction<TransactionType | 'Todos'>) {
      if (state.filters.type === action.payload) return

      state.filters.type = action.payload
      state.filters.page = 1
    },
    setMonth(state, action: PayloadAction<string | 'Todos'>) {
      if (state.filters.month === action.payload) return

      state.filters.month = action.payload
      state.filters.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.filters.pageSize = action.payload
      state.filters.page = 1
    },
    clearFilters(state) {
      state.filters = { ...initialTransactionFilters }
    },
    resetTransactions() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTransactionPage.fulfilled, (state, action) => {
        if (isStaleListResponse(state, action.meta)) return

        transactionsAdapter.upsertMany(state, action.payload.items)
        state.visibleIds = action.payload.items.map((item) => item.id)
        state.total = action.payload.total
        state.totalPages = action.payload.totalPages
        state.filters.page = action.payload.page
        state.view = 'page'
      })
      .addCase(loadAllTransactions.fulfilled, (state, action) => {
        if (isStaleListResponse(state, action.meta)) return

        transactionsAdapter.setAll(state, action.payload)
        state.visibleIds = action.payload.map((item) => item.id)
        state.total = action.payload.length
        state.totalPages = 1
        state.view = 'all'
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        const { transaction, attachmentError } = action.payload

        transactionsAdapter.upsertOne(state, transaction)
        state.mutation.error = attachmentError

        if (state.view !== 'all') return

        insertVisible(state, transaction.id, 0)
        state.total += 1
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        transactionsAdapter.upsertOne(state, action.payload.transaction)
        state.mutation.error = action.payload.attachmentError
      })
      .addCase(deleteTransactions.pending, (state, action) => {
        const ids = action.meta.arg
        const items: RemovalSnapshot[] = []

        for (const id of ids) {
          const transaction = state.entities[id]
          if (!transaction) continue

          items.push({
            transaction,
            index: state.visibleIds.indexOf(id),
          })
        }

        state.pendingRemovals[action.meta.requestId] = {
          items,
          previousTotal: state.total,
        }
        transactionsAdapter.removeMany(state, ids)
        state.visibleIds = state.visibleIds.filter((id) => !ids.includes(id))
        state.total = Math.max(0, state.total - items.length)
      })
      .addCase(deleteTransactions.fulfilled, (state, action) => {
        delete state.pendingRemovals[action.meta.requestId]
      })
      .addCase(deleteTransactions.rejected, (state, action) => {
        const pending = state.pendingRemovals[action.meta.requestId]
        if (!pending) return

        for (const { transaction, index } of pending.items) {
          transactionsAdapter.upsertOne(state, transaction)
          if (index >= 0) insertVisible(state, transaction.id, index)
        }

        state.total = pending.previousTotal
        delete state.pendingRemovals[action.meta.requestId]
      })
      .addCase(removeTransactionAttachment.fulfilled, (state, action) => {
        const { transactionId, attachmentId } = action.payload
        const transaction = state.entities[transactionId]
        if (!transaction?.attachments) return

        transaction.attachments = transaction.attachments.filter(
          (attachment: TransactionAttachment) => attachment.id !== attachmentId
        )
      })
      .addMatcher(
        isPending(loadTransactionPage, loadAllTransactions),
        (state, action) => {
          state.list.requestId = action.meta.requestId
          state.list.status = 'loading'
          state.list.error = null
        }
      )
      .addMatcher(
        isFulfilled(loadTransactionPage, loadAllTransactions),
        (state, action) => {
          if (isStaleListResponse(state, action.meta)) return

          state.list.status = 'success'
          state.list.error = null
        }
      )
      .addMatcher(
        isRejected(loadTransactionPage, loadAllTransactions),
        (state, action) => {
          if (isStaleListResponse(state, action.meta)) return

          if (action.meta.aborted) {
            state.list.status = 'idle'
            state.list.requestId = null
            return
          }

          state.visibleIds = []
          state.list.status = 'error'
          state.list.error =
            action.payload ??
            action.error.message ??
            'Erro ao carregar as transações.'
        }
      )
      .addMatcher(isPending(...mutationThunks), (state) => {
        state.mutation.status = 'loading'
        state.mutation.error = null
      })
      // O pending já zerou o erro. Zerar de novo aqui apagaria o aviso de anexo
      // que create/update gravam quando o sucesso é parcial.
      .addMatcher(isFulfilled(...mutationThunks), (state) => {
        state.mutation.status = 'success'
      })
      .addMatcher(isRejected(...mutationThunks), (state, action) => {
        state.mutation.status = 'error'
        state.mutation.error =
          action.payload ??
          action.error.message ??
          'Não foi possível concluir a operação.'
      })
  },
})

export const {
  clearFilters,
  resetTransactions,
  setMonth,
  setPage,
  setPageSize,
  setSearch,
  setType,
} = transactionsSlice.actions

export const transactionsReducer = transactionsSlice.reducer
