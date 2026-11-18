import { describe, expect, it } from 'vitest'
import type { Transaction } from '@bytebank/domain'
import {
  createFakeTransactionUseCases,
  createTestExtra,
  createTestStore,
} from '../testing/createTestStore'
import {
  loadAllTransactions,
  setSearch,
  setType,
} from '../slices/transactionsSlice'
import {
  selectBalance,
  selectHasActiveFilters,
  selectMonthlyFlow,
  selectStatementPreview,
  selectTypeDistribution,
  selectVisibleMonthGroups,
  selectVisibleTransactions,
} from './transactionsSelectors'

const transactions: Transaction[] = [
  { id: 'a', type: 'Depósito', name: 'Salário', amount: 5000, date: '2026-03-10' },
  { id: 'b', type: 'Pagamento', name: 'Aluguel', amount: -1800, date: '2026-03-05' },
  { id: 'c', type: 'Pix', name: 'Reembolso', amount: 250, date: '2026-02-20' },
  { id: 'd', type: 'Pix', name: 'Presente', amount: -120, date: '2026-02-18' },
  { id: 'e', type: 'Depósito', name: 'Bônus', amount: 700, date: '2026-01-30' },
  { id: 'f', type: 'Pagamento', name: 'Internet', amount: -150, date: '2026-01-12' },
]

async function loadedStore() {
  const store = createTestStore({
    extra: createTestExtra({
      transactions: createFakeTransactionUseCases(transactions),
    }),
  })

  await store.dispatch(loadAllTransactions())

  return store
}

describe('seletores derivados', () => {
  it('calcula o saldo a partir da coleção visível', async () => {
    const store = await loadedStore()

    expect(selectBalance(store.getState())).toBe(3880)
  })

  it('agrupa por mês em ordem decrescente', async () => {
    const store = await loadedStore()

    expect(selectVisibleMonthGroups(store.getState()).map((g) => g.key)).toEqual(
      ['2026-03', '2026-02', '2026-01']
    )
  })

  it('limita o extrato a cinco lançamentos no total', async () => {
    const store = await loadedStore()
    const preview = selectStatementPreview(store.getState())

    const items = preview.flatMap((group) => group.items)
    expect(items).toHaveLength(5)
  })

  it('separa receitas e despesas por mês em ordem crescente', async () => {
    const store = await loadedStore()

    expect(selectMonthlyFlow(store.getState())).toMatchObject([
      { key: '2026-01', Receitas: 700, Despesas: 150 },
      { key: '2026-02', Receitas: 250, Despesas: 120 },
      { key: '2026-03', Receitas: 5000, Despesas: 1800 },
    ])
  })

  it('soma os valores absolutos por tipo', async () => {
    const store = await loadedStore()

    expect(selectTypeDistribution(store.getState())).toEqual(
      expect.arrayContaining([
        { name: 'Depósito', value: 5700 },
        { name: 'Pagamento', value: 1950 },
        { name: 'Pix', value: 370 },
      ])
    )
  })

  it('reaproveita o resultado memoizado enquanto a coleção não muda', async () => {
    const store = await loadedStore()

    const first = selectVisibleTransactions(store.getState())
    const second = selectVisibleTransactions(store.getState())

    expect(second).toBe(first)
  })
})

describe('selectHasActiveFilters', () => {
  it('é falso no estado inicial', () => {
    expect(selectHasActiveFilters(createTestStore().getState())).toBe(false)
  })

  it('reage a qualquer filtro preenchido', () => {
    const store = createTestStore()

    store.dispatch(setSearch('aluguel'))
    expect(selectHasActiveFilters(store.getState())).toBe(true)

    store.dispatch(setType('Todos'))
    expect(selectHasActiveFilters(store.getState())).toBe(true)
  })
})
