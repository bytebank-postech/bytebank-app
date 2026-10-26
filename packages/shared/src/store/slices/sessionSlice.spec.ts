import { describe, expect, it, vi } from 'vitest'
import type { AuthUser } from '@bytebank/domain'
import {
  createFakeSessionGateway,
  createTestExtra,
  createTestStore,
} from '../testing/createTestStore'
import { restoreSession, signIn, signOut } from './sessionSlice'

const user: AuthUser = {
  id: 'u-1',
  name: 'Ada Lovelace',
  email: 'ada@bytebank.dev',
}

function setup(overrides = {}) {
  const getSession = vi.fn().mockResolvedValue(user)

  const store = createTestStore({
    extra: createTestExtra({
      session: createFakeSessionGateway(user, { getSession, ...overrides }),
    }),
  })

  return { store, getSession }
}

describe('restoreSession', () => {
  it('ignora o segundo disparo enquanto o primeiro está em voo', async () => {
    const { store, getSession } = setup()

    const first = store.dispatch(restoreSession())
    const second = store.dispatch(restoreSession())

    await Promise.all([first, second])

    expect(getSession).toHaveBeenCalledOnce()
    expect(store.getState().session.status).toBe('authenticated')
  })

  it('marca a sessão como anônima quando não há usuário', async () => {
    const { store } = setup({ getSession: () => Promise.resolve(null) })

    await store.dispatch(restoreSession())

    expect(store.getState().session).toMatchObject({
      user: null,
      status: 'anonymous',
    })
  })
})

describe('signIn e signOut', () => {
  it('guarda o usuário autenticado', async () => {
    const { store } = setup()

    await store.dispatch(signIn({ email: user.email, password: 'secret' }))

    expect(store.getState().session).toMatchObject({
      user,
      status: 'authenticated',
      error: null,
    })
  })

  it('reporta a falha de credenciais sem manter o usuário', async () => {
    const store = createTestStore({
      extra: createTestExtra({
        session: createFakeSessionGateway(user, {
          login: () => Promise.reject(new Error('Credenciais inválidas.')),
        }),
      }),
    })

    await store.dispatch(signIn({ email: user.email, password: 'errada' }))

    expect(store.getState().session).toMatchObject({
      user: null,
      status: 'anonymous',
      error: 'Credenciais inválidas.',
    })
  })

  it('limpa a sessão assim que o logout é disparado', async () => {
    const { store } = setup()

    await store.dispatch(restoreSession())
    const pending = store.dispatch(signOut())

    expect(store.getState().session).toMatchObject({
      user: null,
      status: 'anonymous',
    })

    await pending
  })
})
