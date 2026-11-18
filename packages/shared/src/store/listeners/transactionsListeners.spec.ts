import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '@bytebank/domain'
import {
  createFakeTransactionUseCases,
  createTestExtra,
  createTestStore,
} from '../testing/createTestStore'
import {
  createTransaction,
  loadAllTransactions,
  setMonth,
  setSearch,
} from '../slices/transactionsSlice'
import { SEARCH_DEBOUNCE_MS } from './transactionsListeners'

const transactions: Transaction[] = [
  { id: 'a', type: 'Depósito', name: 'Salário', amount: 5000, date: '2026-03-10' },
  { id: 'b', type: 'Pagamento', name: 'Aluguel', amount: -1800, date: '2026-03-05' },
]

function setup() {
  const getPage = vi.fn().mockResolvedValue({
    items: transactions,
    total: transactions.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  })

  const store = createTestStore({
    extra: createTestExtra({
      transactions: createFakeTransactionUseCases(transactions, {
        getTransactionPage: { execute: getPage },
      } as never),
    }),
  })

  return { store, getPage }
}

const waitForDebounce = () =>
  new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 150))

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('pipeline reativo dos filtros', () => {
  it('agrupa a digitação em uma única requisição com o último valor', async () => {
    const { store, getPage } = setup()

    store.dispatch(setSearch('a'))
    store.dispatch(setSearch('al'))
    store.dispatch(setSearch('alu'))

    await waitForDebounce()

    expect(getPage).toHaveBeenCalledOnce()
    expect(getPage.mock.calls[0][0]).toMatchObject({ search: 'alu' })
  })

  it('carrega imediatamente quando o filtro não é digitado', async () => {
    const { store, getPage } = setup()

    store.dispatch(setMonth('2026-03'))
    await flush()

    expect(getPage).toHaveBeenCalledOnce()
    expect(getPage.mock.calls[0][0]).toMatchObject({ month: '2026-03' })
  })

  it('revalida a página depois de criar uma transação', async () => {
    const { store, getPage } = setup()

    await store.dispatch(
      createTransaction({
        data: { type: 'Pix', name: 'Freela', amount: 900, date: '2026-03-12' },
      })
    )
    await flush()

    expect(getPage).toHaveBeenCalledOnce()
  })

  it('não dispara requisição de página quando a visão é a coleção completa', async () => {
    const { store, getPage } = setup()

    await store.dispatch(loadAllTransactions())
    store.dispatch(setMonth('2026-03'))
    await waitForDebounce()

    expect(getPage).not.toHaveBeenCalled()
  })
})
