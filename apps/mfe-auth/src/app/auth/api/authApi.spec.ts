import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from '@bytebank/infrastructure/server'
import { POST as login } from './login/route'
import { POST as logout } from './logout/route'
import { POST as register } from './register/route'
import { GET as session } from './session/route'

const BASE_URL = 'http://localhost:3000'

const postJson = (path: string, body: unknown) =>
  new Request(new URL(path, BASE_URL), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

const sessionRequest = (token?: string) =>
  new NextRequest(new URL('/auth/api/session', BASE_URL), {
    headers: token ? { cookie: `${AUTH_COOKIE_NAME}=${token}` } : {},
  })

const readSessionCookie = (response: Response) => {
  const header = response.headers.get('set-cookie') ?? ''
  const token = header.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]*)`))?.[1]
  return { header, token }
}

const uniqueEmail = () => `pessoa-${crypto.randomUUID()}@bytebank.dev`

describe('API de autenticação', () => {
  it('faz login com cookie httpOnly e sem devolver o token no corpo', async () => {
    const response = await login(
      postJson('/auth/api/login', {
        email: 'usuario@bytebank.com',
        password: 'senha123',
      })
    )
    const body = await response.json()
    const { header, token } = readSessionCookie(response)

    expect(response.status).toBe(200)
    expect(body).toEqual({
      user: { id: '1', name: 'Usuário ByteBank', email: 'usuario@bytebank.com' },
    })
    expect(body).not.toHaveProperty('token')
    expect(token).toBeTruthy()
    expect(header).toContain('HttpOnly')
    expect(header.toLowerCase()).toContain('samesite=lax')
    expect(header).toContain('Max-Age=28800')
  })

  it('rejeita credenciais inválidas sem criar cookie', async () => {
    const response = await login(
      postJson('/auth/api/login', {
        email: 'usuario@bytebank.com',
        password: 'errada',
      })
    )

    expect(response.status).toBe(401)
    expect(response.headers.get('set-cookie')).toBeNull()
  })

  it('trata corpo inválido sem lançar erro', async () => {
    const response = await login(
      new Request(new URL('/auth/api/login', BASE_URL), {
        method: 'POST',
        body: 'nao-e-json',
      })
    )

    expect(response.status).toBe(401)
  })

  it('bloqueia temporariamente após tentativas repetidas', async () => {
    const email = uniqueEmail()
    const attempt = () =>
      login(postJson('/auth/api/login', { email, password: 'errada' }))

    for (let index = 0; index < 5; index += 1) {
      expect((await attempt()).status).toBe(401)
    }
    const blocked = await attempt()

    expect(blocked.status).toBe(429)
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0)
  })

  it('cadastra, restaura a sessão e encerra com logout', async () => {
    const email = uniqueEmail()

    const registered = await register(
      postJson('/auth/api/register', { email, password: 'senha-nova' })
    )
    const { token } = readSessionCookie(registered)
    const registeredBody = await registered.json()

    expect(registered.status).toBe(200)
    expect(registeredBody).not.toHaveProperty('token')

    const restored = await session(sessionRequest(token))
    await expect(restored.json()).resolves.toEqual({
      user: registeredBody.user,
    })

    const loggedOut = await logout()
    const { header, token: clearedToken } = readSessionCookie(loggedOut)
    expect(clearedToken).toBe('')
    expect(header).toContain('Max-Age=0')
  })

  it('responde 401 para sessão ausente ou token inválido', async () => {
    const withoutCookie = await session(sessionRequest())
    const withInvalidToken = await session(sessionRequest('token-invalido'))

    expect(withoutCookie.status).toBe(401)
    expect(withInvalidToken.status).toBe(401)
  })

  it('impede cadastro duplicado', async () => {
    const response = await register(
      postJson('/auth/api/register', {
        email: 'USUARIO@bytebank.com',
        password: 'senha123',
      })
    )

    expect(response.status).toBe(409)
  })
})
