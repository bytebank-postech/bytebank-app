import { InvalidCredentialsError, ValidationError } from '@bytebank/application'
import {
  createAuthUseCases,
  createLoginAttemptLimiter,
} from '@bytebank/infrastructure/server'
import { NextResponse } from 'next/server'
import {
  createSessionResponse,
  readCredentials,
  toLogMessage,
} from '@/server/sessionResponse'

const authUseCases = createAuthUseCases()
const loginAttemptLimiter = createLoginAttemptLimiter()

export async function POST(request: Request) {
  const { email, password } = await readCredentials(request)
  const attemptKey = email.trim().toLowerCase()

  const retryAfterSeconds = loginAttemptLimiter.retryAfterSeconds(attemptKey)
  if (retryAfterSeconds > 0) {
    return NextResponse.json(
      { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  try {
    const { user, token } = await authUseCases.loginUser.execute(
      email,
      password
    )
    loginAttemptLimiter.reset(attemptKey)
    return createSessionResponse(user, token)
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      loginAttemptLimiter.registerFailure(attemptKey)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[auth] Falha inesperada no login:', toLogMessage(error))
    return NextResponse.json(
      { error: 'Não foi possível concluir a autenticação.' },
      { status: 400 }
    )
  }
}
