import { describe, expect, it } from 'vitest'
import type { Transaction } from './transaction'
import {
  buildMonthlyFlow,
  buildTypeDistribution,
  previewMonthGroups,
} from './analytics'

const transactions: Transaction[] = [
  { id: 'a', type: 'Depósito', name: 'Salário', amount: 5000, date: '2026-03-10' },
  { id: 'b', type: 'Pagamento', name: 'Aluguel', amount: -1800, date: '2026-03-05' },
  { id: 'c', type: 'Pix', name: 'Reembolso', amount: 250, date: '2026-02-20' },
  { id: 'd', type: 'Pix', name: 'Presente', amount: -120, date: '2026-02-18' },
]

describe('buildMonthlyFlow', () => {
  it('separa receitas de despesas e ordena do mês mais antigo ao mais recente', () => {
    expect(buildMonthlyFlow(transactions)).toMatchObject([
      { key: '2026-02', Receitas: 250, Despesas: 120 },
      { key: '2026-03', Receitas: 5000, Despesas: 1800 },
    ])
  })

  it('trata valor zero como receita', () => {
    const flow = buildMonthlyFlow([
      { id: 'z', type: 'Pix', name: 'Estorno', amount: 0, date: '2026-04-01' },
    ])

    expect(flow[0]).toMatchObject({ Receitas: 0, Despesas: 0 })
  })

  it('devolve lista vazia sem transações', () => {
    expect(buildMonthlyFlow([])).toEqual([])
  })
})

describe('buildTypeDistribution', () => {
  it('soma os valores absolutos por tipo', () => {
    expect(buildTypeDistribution(transactions)).toEqual([
      { name: 'Depósito', value: 5000 },
      { name: 'Pagamento', value: 1800 },
      { name: 'Pix', value: 370 },
    ])
  })
})

describe('previewMonthGroups', () => {
  it('respeita o limite total atravessando os meses', () => {
    const preview = previewMonthGroups(transactions, 3)

    expect(preview.flatMap((group) => group.items)).toHaveLength(3)
    expect(preview.map((group) => group.key)).toEqual(['2026-03', '2026-02'])
  })

  it('devolve todos os grupos quando o limite é maior que a coleção', () => {
    const preview = previewMonthGroups(transactions, 10)

    expect(preview.flatMap((group) => group.items)).toHaveLength(4)
  })
})
