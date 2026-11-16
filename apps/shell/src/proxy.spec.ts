import { describe, expect, it } from 'vitest'
import { AUTH_COOKIE_NAME } from '@bytebank/infrastructure/server'
import { proxy } from './proxy'
import {
  createRequest,
  createSessionToken,
  createTestUser,
} from './testing/requests'

const expectSessionCookieCleared = (response: Response) => {
  expect(response.headers.get('set-cookie')).toContain(`${AUTH_COOKIE_NAME}=;`)
}

describe('proxy — proteção de rotas', () => {
  it('redireciona páginas protegidas para /auth quando não há sessão', async () => {
    const response = await proxy(createRequest('/transactions'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth')
  })

  it('responde 401 em JSON para a API em vez de redirecionar', async () => {
    const response = await proxy(createRequest('/api/transactions'))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: 'Sessão inválida ou expirada.',
    })
  })

  it('remove o cookie quando o token é inválido', async () => {
    const pageResponse = await proxy(
      createRequest('/', { token: 'token-invalido' })
    )
    const apiResponse = await proxy(
      createRequest('/api/transactions', { token: 'token-invalido' })
    )

    expect(pageResponse.status).toBe(307)
    expectSessionCookieCleared(pageResponse)
    expect(apiResponse.status).toBe(401)
    expectSessionCookieCleared(apiResponse)
  })

  it('deixa a requisição seguir quando o token é válido', async () => {
    const token = await createSessionToken(createTestUser())

    const response = await proxy(createRequest('/transactions', { token }))

    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})
