import type {
  TransactionPage,
  TransactionPageFilters,
} from '@bytebank/application'

const KEY = 'bytebank:transaction-navigation:v1'
const TTL = 30_000
let pending: AbortController | undefined

type Entry = { userId: string; expiresAt: number; page: TransactionPage }

function storage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage
  } catch {
    return undefined
  }
}

function read(userId: string): Entry | undefined {
  try {
    const raw = storage()?.getItem(KEY)
    if (!raw) return
    const entry = JSON.parse(raw) as Entry
    if (
      entry.userId === userId &&
      entry.expiresAt > Date.now() &&
      entry.page?.page === 1 &&
      entry.page.pageSize === 10 &&
      Array.isArray(entry.page.items)
    )
      return entry
  } catch {
    // Cache indisponível ou inválido: a consulta normal continua disponível.
  }
}

export function clearTransactionNavigationCache() {
  pending?.abort()
  pending = undefined
  try {
    storage()?.removeItem(KEY)
  } catch {
    /* Cache é opcional. */
  }
}

export async function prefetchTransactionNavigation(userId: string) {
  if (!storage() || pending || read(userId)) return
  const controller = new AbortController()
  pending = controller
  try {
    const response = await fetch('/api/transactions?page=1&pageSize=10', {
      signal: controller.signal,
      credentials: 'same-origin',
      cache: 'no-store',
    })
    if (!response.ok) return
    const page: TransactionPage = await response.json()
    if (controller.signal.aborted) return
    storage()?.setItem(
      KEY,
      JSON.stringify({
        userId,
        expiresAt: Date.now() + TTL,
        page,
      } satisfies Entry)
    )
  } catch {
    // Falha de prefetch nunca impede a navegação ou a consulta normal.
  } finally {
    if (pending === controller) pending = undefined
  }
}

export function takeTransactionNavigationCache(
  userId: string,
  filters: TransactionPageFilters
): TransactionPage | undefined {
  if (
    filters.page !== 1 ||
    filters.pageSize !== 10 ||
    filters.search ||
    filters.type ||
    filters.month
  )
    return
  const entry = read(userId)
  // Handoff de uso único entre documentos; não persiste como cache geral.
  try {
    storage()?.removeItem(KEY)
  } catch {
    /* Cache é opcional. */
  }
  return entry?.page
}
