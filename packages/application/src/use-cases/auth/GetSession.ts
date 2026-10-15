import type { AuthUser } from '@bytebank/domain'
import type { TokenService } from '../../ports/TokenService'

export class GetSession {
  constructor(private readonly tokens: TokenService) {}

  execute(token: string | undefined | null): Promise<AuthUser | null> {
    if (!token) return Promise.resolve(null)
    return this.tokens.verify(token)
  }
}
