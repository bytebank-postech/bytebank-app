import type { Transaction } from '@/types/transaction'

export function totalBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0)
}

export function formatDisplayDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export type MonthGroup = {
  key: string
  label: string
  items: Transaction[]
}

export function groupTransactionsByMonth(
  transactions: Transaction[]
): MonthGroup[] {
  const map = new Map<string, Transaction[]>()
  for (const t of transactions) {
    const d = new Date(`${t.date}T12:00:00`)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  const keys = [...map.keys()].sort((a, b) => b.localeCompare(a))
  return keys.map((key) => {
    const items = map.get(key)!
    items.sort((a, b) => b.date.localeCompare(a.date))
    const [yStr, mStr] = key.split('-')
    const labelDate = new Date(Number(yStr), Number(mStr) - 1, 1)
    const label = labelDate
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^./, (c) => c.toUpperCase())
    return { key, label, items }
  })
}
