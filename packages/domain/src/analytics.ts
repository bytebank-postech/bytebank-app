import type { Transaction, TransactionType } from './transaction'
import { groupTransactionsByMonth, type MonthGroup } from './model'

export type MonthlyFlowPoint = {
  key: string
  name: string
  Receitas: number
  Despesas: number
}

export type TypeDistributionPoint = {
  name: TransactionType
  value: number
}

export function buildMonthlyFlow(
  transactions: Transaction[]
): MonthlyFlowPoint[] {
  const months = new Map<string, { Receitas: number; Despesas: number }>()

  for (const transaction of transactions) {
    const key = transaction.date.slice(0, 7)
    const entry = months.get(key) ?? { Receitas: 0, Despesas: 0 }

    if (transaction.amount >= 0) {
      entry.Receitas += transaction.amount
    } else {
      entry.Despesas += Math.abs(transaction.amount)
    }

    months.set(key, entry)
  }

  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, values]) => ({
      key,
      name: new Date(`${key}-01T12:00:00`).toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      }),
      ...values,
    }))
}

export function buildTypeDistribution(
  transactions: Transaction[]
): TypeDistributionPoint[] {
  const types = new Map<TransactionType, number>()

  for (const transaction of transactions) {
    const current = types.get(transaction.type) ?? 0
    types.set(transaction.type, current + Math.abs(transaction.amount))
  }

  return [...types.entries()].map(([name, value]) => ({ name, value }))
}

export function previewMonthGroups(
  transactions: Transaction[],
  limit: number
): MonthGroup[] {
  const preview: MonthGroup[] = []
  let remaining = limit

  for (const group of groupTransactionsByMonth(transactions)) {
    if (remaining <= 0) break

    const items = group.items.slice(0, remaining)
    remaining -= items.length
    preview.push({ ...group, items })
  }

  return preview
}
