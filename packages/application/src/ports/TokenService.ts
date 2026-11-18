import type { AuthUser } from '@bytebank/domain'

export interface TokenService {
  sign(user: AuthUser): Promise<string>
  verify(token: string): Promise<AuthUser | null>
}
