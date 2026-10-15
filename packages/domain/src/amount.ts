import type { TransactionType } from './transaction'

export function parseBRLAmount(raw: string): number | null {
  const s0 = raw.trim()
  if (!s0) return null
  const cleaned = s0.replace(/[^0-9,.-]/g, '')
  if (!cleaned) return null
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export function amountForType(type: TransactionType, absolute: number): number {
  if (type === 'Depósito' || type === 'Pix') return Math.abs(absolute)
  return -Math.abs(absolute)
}
