import type { AuthUser } from '@bytebank/domain'
import { InvalidCredentialsError } from '../../errors'
import type { AuthUserRepository } from '../../ports/AuthUserRepository'
import type { TokenService } from '../../ports/TokenService'

export type LoginResult = {
  user: AuthUser
  token: string
}

export class LoginUser {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly tokens: TokenService
  ) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      throw new InvalidCredentialsError('Preencha e-mail e senha.')
    }

    const user = await this.users.findByEmailAndPassword(trimmedEmail, password)
    if (!user) throw new InvalidCredentialsError()
    const token = await this.tokens.sign(user)
    return { user, token }
  }
}
