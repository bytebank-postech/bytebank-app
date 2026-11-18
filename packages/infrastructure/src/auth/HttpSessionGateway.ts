import type { Credentials, SessionGateway } from '@bytebank/application'
import type { AuthUser } from '@bytebank/domain'

const LOGIN_URL = '/auth/api/login'
const REGISTER_URL = '/auth/api/register'
const LOGOUT_URL = '/auth/api/logout'
const SESSION_URL = '/auth/api/session'

async function postCredentials(
  url: string,
  { email, password }: Credentials,
  fallbackMessage: string
): Promise<AuthUser> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error ?? fallbackMessage)
  }

  return data.user as AuthUser
}

export class HttpSessionGateway implements SessionGateway {
  login(credentials: Credentials): Promise<AuthUser> {
    return postCredentials(LOGIN_URL, credentials, 'Falha ao entrar.')
  }

  register(credentials: Credentials): Promise<AuthUser> {
    return postCredentials(REGISTER_URL, credentials, 'Falha ao criar conta.')
  }

  async logout(): Promise<void> {
    await fetch(LOGOUT_URL, { method: 'POST', cache: 'no-store' })
  }

  async getSession(): Promise<AuthUser | null> {
    const response = await fetch(SESSION_URL, { cache: 'no-store' })

    if (!response.ok) {
      return null
    }

    const data = await response.json().catch(() => ({}))

    return (data.user as AuthUser | undefined) ?? null
  }
}
