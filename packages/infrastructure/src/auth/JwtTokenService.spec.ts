import { afterEach, describe, expect, it, vi } from 'vitest'
import { SignJWT, UnsecuredJWT } from 'jose'
import { JwtTokenService } from './JwtTokenService'
import { SESSION_DURATION_SECONDS } from './sessionCookie'

const user = { id: 'u-1', name: 'Ada', email: 'ada@bytebank.dev' }

describe('JwtTokenService', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('assina e verifica o token do usuário', async () => {
    const service = new JwtTokenService()

    const token = await service.sign(user)

    await expect(service.verify(token)).resolves.toEqual(user)
  })

  it('rejeita token expirado após a duração da sessão', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const service = new JwtTokenService()
    const token = await service.sign(user)

    vi.setSystemTime(
      new Date(Date.now() + (SESSION_DURATION_SECONDS + 1) * 1000)
    )

    await expect(service.verify(token)).resolves.toBeNull()
  })

  it('rejeita token adulterado', async () => {
    const service = new JwtTokenService()
    const token = await service.sign(user)
    const [header, , signature] = token.split('.')
    const forgedPayload = Buffer.from(
      JSON.stringify({ sub: 'outro-usuario', name: 'X', email: 'x@x.dev' })
    ).toString('base64url')

    await expect(
      service.verify(`${header}.${forgedPayload}.${signature}`)
    ).resolves.toBeNull()
  })

  it('rejeita token assinado com outro segredo', async () => {
    const forged = await new SignJWT({ name: user.name, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuer('bytebank')
      .setAudience('bytebank-app')
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode('segredo-do-atacante'))

    await expect(new JwtTokenService().verify(forged)).resolves.toBeNull()
  })

  it('rejeita token sem assinatura (alg none)', async () => {
    const unsigned = new UnsecuredJWT({ name: user.name, email: user.email })
      .setSubject(user.id)
      .setIssuer('bytebank')
      .setAudience('bytebank-app')
      .setExpirationTime('1h')
      .encode()

    await expect(new JwtTokenService().verify(unsigned)).resolves.toBeNull()
  })

  it('rejeita valores que não são JWT', async () => {
    await expect(new JwtTokenService().verify('nao-e-um-token')).resolves.toBeNull()
  })
})
