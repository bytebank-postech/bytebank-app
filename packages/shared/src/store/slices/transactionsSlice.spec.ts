import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '@bytebank/domain'
import {
  createFakeTransactionUseCases,
  createTestExtra,
  createTestStore,
} from '../testing/createTestStore'
import {
  createTransaction,
  deleteTransactions,
  loadAllTransactions,
  loadTransactionPage,
  setMonth,
  setPage,
  setSearch,
  setType,
  toPageFilters,
  updateTransaction,
} from './transactionsSlice'
import {
  selectTotalItems,
  selectVisibleTransactions,
} from '../selectors/transactionsSelectors'

const transactions: Transaction[] = [
  { id: 'a', type: 'Depósito', name: 'Salário', amount: 5000, date: '2026-03-10' },
  { id: 'b', type: 'Pagamento', name: 'Aluguel', amount: -1800, date: '2026-03-05' },
  { id: 'c', type: 'Pix', name: 'Reembolso', amount: 250, date: '2026-02-20' },
]

describe('toPageFilters', () => {
  it('converte os sentinelas "Todos" em ausência de filtro', () => {
    const filters = toPageFilters({
      search: '  ',
      type: 'Todos',
      month: 'Todos',
      page: 2,
      pageSize: 10,
    })

    expect(filters).toEqual({
      page: 2,
      pageSize: 10,
      search: undefined,
      type: undefined,
      month: undefined,
    })
  })

  it('repassa os filtros preenchidos', () => {
    const filters = toPageFilters({
      search: ' aluguel ',
      type: 'Pagamento',
      month: '2026-03',
      page: 1,
      pageSize: 5,
    })

    expect(filters).toMatchObject({
      search: 'aluguel',
      type: 'Pagamento',
      month: '2026-03',
    })
  })
})

describe('carregamento da coleção', () => {
  it('normaliza a página e preserva a ordem recebida', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions),
      }),
    })

    await store.dispatch(loadTransactionPage())

    const state = store.getState().transactions
    expect(state.ids).toHaveLength(3)
    expect(state.visibleIds).toEqual(['a', 'b', 'c'])
    expect(state.list.status).toBe('success')
    expect(selectTotalItems(store.getState())).toBe(3)
  })

  it('registra o erro sem derrubar a coleção normalizada', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions, {
          getTransactionPage: {
            execute: () => Promise.reject(new Error('API fora do ar')),
          },
        } as never),
      }),
    })

    await store.dispatch(loadTransactionPage())

    const state = store.getState().transactions
    expect(state.list.status).toBe('error')
    expect(state.list.error).toBe('API fora do ar')
    expect(state.visibleIds).toEqual([])
  })

  it('volta para o estado ocioso quando a requisição é abortada', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions),
      }),
    })

    const request = store.dispatch(loadTransactionPage())
    request.abort()
    await request

    const state = store.getState().transactions
    expect(state.list.status).toBe('idle')
    expect(state.list.error).toBeNull()
  })

  it('descarta a resposta de uma requisição superada por outra mais recente', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions),
      }),
    })

    const stale = store.dispatch(loadTransactionPage())
    const latest = store.dispatch(loadAllTransactions())

    await Promise.all([stale, latest])

    expect(store.getState().transactions.view).toBe('all')
  })
})

describe('exclusão otimista', () => {
  it('remove o item antes da confirmação do servidor', async () => {
    let resolveDelete: () => void = () => {}
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions, {
          deleteTransaction: {
            execute: () =>
              new Promise<void>((resolve) => {
                resolveDelete = resolve
              }),
          },
        } as never),
      }),
    })

    await store.dispatch(loadTransactionPage())
    const pending = store.dispatch(deleteTransactions(['b']))

    expect(store.getState().transactions.visibleIds).toEqual(['a', 'c'])
    expect(selectTotalItems(store.getState())).toBe(2)

    resolveDelete()
    await pending

    expect(store.getState().transactions.visibleIds).toEqual(['a', 'c'])
    expect(store.getState().transactions.pendingRemovals).toEqual({})
  })

  it('devolve o total exato de antes da remoção, mesmo dessincronizado', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions, {
          getTransactionPage: {
            execute: () =>
              Promise.resolve({
                items: transactions,
                total: 1,
                page: 1,
                pageSize: 10,
                totalPages: 1,
              }),
          },
          deleteTransaction: {
            execute: () => Promise.reject(new Error('Falha ao excluir')),
          },
        } as never),
      }),
    })

    await store.dispatch(loadTransactionPage())
    expect(selectTotalItems(store.getState())).toBe(1)

    await store.dispatch(deleteTransactions(['a', 'b', 'c']))

    expect(selectTotalItems(store.getState())).toBe(1)
  })

  it('reverte a remoção na posição original quando a API falha', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions, {
          deleteTransaction: {
            execute: () => Promise.reject(new Error('Falha ao excluir')),
          },
        } as never),
      }),
    })

    await store.dispatch(loadAllTransactions())
    await store.dispatch(deleteTransactions(['b']))

    const state = store.getState().transactions
    expect(state.visibleIds).toEqual(['a', 'b', 'c'])
    expect(state.mutation.error).toBe('Falha ao excluir')
    expect(state.pendingRemovals).toEqual({})
    expect(selectTotalItems(store.getState())).toBe(3)
  })
})

describe('mutations', () => {
  it('insere a transação criada no topo e envia os anexos', async () => {
    const addAttachments = vi.fn().mockResolvedValue([
      { id: 'att-1', name: 'nota.pdf', mimeType: 'application/pdf', size: 10, url: '/att-1' },
    ])

    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions, {
          addTransactionAttachments: { execute: addAttachments },
        } as never),
        toAttachmentUploads: () =>
          Promise.resolve([
            {
              name: 'nota.pdf',
              mimeType: 'application/pdf',
              size: 10,
              content: new ArrayBuffer(10),
            },
          ]),
      }),
    })

    await store.dispatch(loadAllTransactions())
    await store.dispatch(
      createTransaction({
        data: {
          type: 'Pix',
          name: 'Freela',
          amount: 900,
          date: '2026-03-12',
        },
        files: [new File(['x'], 'nota.pdf')],
      })
    )

    const created = selectVisibleTransactions(store.getState())[0]
    expect(created.name).toBe('Freela')
    expect(created.attachments).toHaveLength(1)
    expect(addAttachments).toHaveBeenCalledOnce()
  })

  it('deixa a página exibida para a revalidação quando a visão é paginada', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions),
      }),
    })

    await store.dispatch(loadTransactionPage())
    await store.dispatch(
      createTransaction({
        data: { type: 'Pix', name: 'Freela', amount: 900, date: '2026-03-12' },
      })
    )

    const state = store.getState().transactions
    expect(state.visibleIds).toEqual(['a', 'b', 'c'])
    expect(selectTotalItems(store.getState())).toBe(3)
  })

  it('mantém a transação criada quando só o envio dos anexos falha', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions, {
          addTransactionAttachments: {
            execute: () => Promise.reject(new Error('Anexo recusado')),
          },
        } as never),
        toAttachmentUploads: () =>
          Promise.resolve([
            {
              name: 'nota.pdf',
              mimeType: 'application/pdf',
              size: 10,
              content: new ArrayBuffer(10),
            },
          ]),
      }),
    })

    await store.dispatch(loadAllTransactions())
    const action = await store.dispatch(
      createTransaction({
        data: { type: 'Pix', name: 'Freela', amount: 900, date: '2026-03-12' },
        files: [new File(['x'], 'nota.pdf')],
      })
    )

    expect(createTransaction.fulfilled.match(action)).toBe(true)

    const state = store.getState().transactions
    expect(selectVisibleTransactions(store.getState())[0].name).toBe('Freela')
    expect(state.mutation.status).toBe('success')
    expect(state.mutation.error).toBe('Anexo recusado')
  })

  it('substitui a entidade atualizada sem alterar a ordem exibida', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        transactions: createFakeTransactionUseCases(transactions),
      }),
    })

    await store.dispatch(loadAllTransactions())
    await store.dispatch(
      updateTransaction({ id: 'b', data: { name: 'Aluguel reajustado' } })
    )

    const state = store.getState().transactions
    expect(state.visibleIds).toEqual(['a', 'b', 'c'])
    expect(state.entities.b.name).toBe('Aluguel reajustado')
  })
})

describe('filtros', () => {
  it('volta para a primeira página ao mudar busca ou tipo', () => {
    const store = createTestStore()

    store.dispatch(setSearch('aluguel'))
    expect(store.getState().transactions.filters.page).toBe(1)

    store.dispatch(setType('Pagamento'))
    expect(store.getState().transactions.filters).toMatchObject({
      search: 'aluguel',
      type: 'Pagamento',
      page: 1,
    })
  })

  it('preserva a página quando o filtro é reatribuído com o mesmo valor', () => {
    const store = createTestStore()

    store.dispatch(setSearch('aluguel'))
    store.dispatch(setPage(3))

    store.dispatch(setSearch('aluguel'))
    store.dispatch(setType('Todos'))
    store.dispatch(setMonth('Todos'))

    expect(store.getState().transactions.filters.page).toBe(3)
  })
})
