import type { Transaction, TransactionType } from '@/types/transaction'
import { transactionTypeColors } from '@/components/ui/Chart/Chart.theme'

export function buildMonthlyFlowData(transactions: Transaction[]) {
  const map = new Map<string, { Receitas: number; Despesas: number }>()

  for (const t of transactions) {
    const d = new Date(`${t.date}T12:00:00`)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const entry = map.get(key) ?? { Receitas: 0, Despesas: 0 }

    if (t.amount >= 0) {
      entry.Receitas += t.amount
    } else {
      entry.Despesas += Math.abs(t.amount)
    }

    map.set(key, entry)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, values]) => {
      const [yStr, mStr] = key.split('-')
      const labelDate = new Date(Number(yStr), Number(mStr) - 1, 1)
      const name = labelDate
        .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        .replace('.', '')

      return { name, ...values }
    })
}

export function buildTypeDistributionData(transactions: Transaction[]) {
  const map = new Map<TransactionType, number>()

  for (const t of transactions) {
    map.set(t.type, (map.get(t.type) ?? 0) + Math.abs(t.amount))
  }

  return [...map.entries()].map(([type, value]) => ({
    name: type,
    value,
    fill: transactionTypeColors[type],
  }))
}
