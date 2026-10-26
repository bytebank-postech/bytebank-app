import type { AuthUser } from '@bytebank/domain'

export type Credentials = {
  email: string
  password: string
}

export interface SessionGateway {
  login(credentials: Credentials): Promise<AuthUser>
  register(credentials: Credentials): Promise<AuthUser>
  logout(): Promise<void>
  getSession(): Promise<AuthUser | null>
}
