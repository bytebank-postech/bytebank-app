import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearTransactionNavigationCache,
  prefetchTransactionNavigation,
  takeTransactionNavigationCache,
} from './transactionNavigationCache'

const filters = { page: 1, pageSize: 10 }
const page = { ...filters, items: [], total: 0, totalPages: 1 }

describe('cache de navegação entre MFEs', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => page,
      })
    )
  })
  afterEach(() => {
    clearTransactionNavigationCache()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('reutiliza a primeira página uma vez após recriar o módulo do MFE', async () => {
    await prefetchTransactionNavigation('user')
    vi.resetModules()
    const destination = await import('./transactionNavigationCache')
    expect(destination.takeTransactionNavigationCache('user', filters)).toEqual(
      page
    )
    expect(
      destination.takeTransactionNavigationCache('user', filters)
    ).toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('não reutiliza dados de outro usuário, filtros ou dados expirados', async () => {
    vi.useFakeTimers()
    await prefetchTransactionNavigation('user')
    expect(
      takeTransactionNavigationCache('user', { ...filters, search: 'pix' })
    ).toBeUndefined()
    expect(takeTransactionNavigationCache('other', filters)).toBeUndefined()
    await prefetchTransactionNavigation('user')
    vi.advanceTimersByTime(30_001)
    expect(takeTransactionNavigationCache('user', filters)).toBeUndefined()
  })

  it('descarta resposta que termina depois de uma invalidação', async () => {
    let finish!: (value: Response) => void
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        finish = resolve
      })
    )
    const request = prefetchTransactionNavigation('user')
    clearTransactionNavigationCache()
    finish(new Response(JSON.stringify(page), { status: 200 }))
    await request
    expect(takeTransactionNavigationCache('user', filters)).toBeUndefined()
  })

  it('ignora armazenamento bloqueado e falhas de rede', async () => {
    vi.stubGlobal('window', {
      get sessionStorage() {
        throw new Error('blocked')
      },
    })
    await expect(prefetchTransactionNavigation('user')).resolves.toBeUndefined()
    expect(takeTransactionNavigationCache('user', filters)).toBeUndefined()
    expect(clearTransactionNavigationCache).not.toThrow()
  })
})
