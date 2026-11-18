import { describe, expect, it, vi } from 'vitest'
import type { QueryClient } from '@tanstack/react-query'
import type { AuthUser, Transaction } from '@bytebank/domain'
import {
  createFakeSessionGateway,
  createFakeTransactionUseCases,
  createTestExtra,
  createTestStore,
} from '../testing/createTestStore'
import {
  SESSION_EXPIRED_MESSAGE,
  restoreSession,
  signIn,
  signOut,
} from '../slices/sessionSlice'
import {
  createTransaction,
  loadAllTransactions,
  loadTransactionPage,
} from '../slices/transactionsSlice'

const user: AuthUser = { id: 'u-1', name: 'Ada', email: 'ada@bytebank.dev' }

const transactions: Transaction[] = [
  { id: 'a', type: 'Depósito', name: 'Salário', amount: 5000, date: '2026-03-10' },
]

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const createFakeQueryClient = () =>
  ({
    clear: vi.fn(),
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
    fetchQuery: vi.fn(({ queryFn }) => queryFn()),
  }) as unknown as QueryClient & {
    clear: ReturnType<typeof vi.fn>
    invalidateQueries: ReturnType<typeof vi.fn>
  }

type SetupOptions = {
  sessionAfterFailure: AuthUser | null
  failRequests?: boolean
}

const setup = ({ sessionAfterFailure, failRequests = true }: SetupOptions) => {
  const getSession = vi
    .fn()
    .mockResolvedValueOnce(user)
    .mockResolvedValue(sessionAfterFailure)
  const failure = () => Promise.reject(new Error('Não autorizado'))
  const queryClient = createFakeQueryClient()

  const store = createTestStore({
    extra: createTestExtra({
      session: createFakeSessionGateway(user, { getSession }),
      transactions: createFakeTransactionUseCases(
        transactions,
        failRequests
          ? ({
              listTransactions: { execute: failure },
              getTransactionPage: { execute: failure },
            } as never)
          : {}
      ),
      queryClient,
    }),
  })

  return { store, getSession, queryClient }
}

describe('integração entre sessão e transações', () => {
  it('encerra a sessão local quando a API falha porque o token expirou', async () => {
    const { store, queryClient } = setup({ sessionAfterFailure: null })
    await store.dispatch(restoreSession())

    await store.dispatch(loadTransactionPage())
    await flush()

    expect(store.getState().session).toMatchObject({
      user: null,
      status: 'anonymous',
      error: SESSION_EXPIRED_MESSAGE,
    })
    expect(queryClient.clear).toHaveBeenCalled()
    expect(store.getState().transactions.ids).toEqual([])
  })

  it('mantém a sessão quando a falha não é de autenticação', async () => {
    const { store, getSession } = setup({ sessionAfterFailure: user })
    await store.dispatch(restoreSession())

    await store.dispatch(loadAllTransactions())
    await flush()

    expect(getSession).toHaveBeenCalledTimes(2)
    expect(store.getState().session.status).toBe('authenticated')
  })

  it('não consulta a sessão quando o usuário já está anônimo', async () => {
    const { store, getSession } = setup({ sessionAfterFailure: null })

    await store.dispatch(loadTransactionPage())
    await flush()

    expect(getSession).not.toHaveBeenCalled()
  })

  it('limpa o cache do React Query no login e no logout', async () => {
    const { store, queryClient } = setup({
      sessionAfterFailure: user,
      failRequests: false,
    })

    await store.dispatch(signIn({ email: user.email, password: 'secret' }))
    expect(queryClient.clear).toHaveBeenCalledTimes(1)

    await store.dispatch(signOut())
    expect(queryClient.clear).toHaveBeenCalledTimes(2)
  })

  it('invalida as consultas do usuário depois de uma mutação', async () => {
    const { store, queryClient } = setup({
      sessionAfterFailure: user,
      failRequests: false,
    })
    await store.dispatch(restoreSession())

    await store.dispatch(
      createTransaction({
        data: { type: 'Pix', name: 'Freela', amount: 900, date: '2026-03-12' },
      })
    )
    await flush()

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['transactions', user.id],
    })
  })
})
