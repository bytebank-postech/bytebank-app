import { NextResponse } from 'next/server'
import type { Credentials } from '@bytebank/application'
import type { AuthUser } from '@bytebank/domain'
import {
  AUTH_COOKIE_NAME,
  getSessionCookieOptions,
} from '@bytebank/infrastructure/server'

const toText = (value: unknown) => (typeof value === 'string' ? value : '')

export const toLogMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'erro desconhecido'

export const readCredentials = async (
  request: Request
): Promise<Credentials> => {
  const body: unknown = await request.json().catch(() => null)
  if (typeof body !== 'object' || body === null) {
    return { email: '', password: '' }
  }

  const { email, password } = body as Record<string, unknown>
  return { email: toText(email), password: toText(password) }
}

export const createSessionResponse = (user: AuthUser, token: string) => {
  const response = NextResponse.json({ user })
  response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions())
  return response
}

export const createLogoutResponse = () => {
  const response = NextResponse.json({
    message: 'Logout realizado com sucesso',
  })
  response.cookies.set(AUTH_COOKIE_NAME, '', getSessionCookieOptions(0))
  return response
}
