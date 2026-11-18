import type { AuthUser } from '@bytebank/domain'
import { EmailAlreadyInUseError, ValidationError } from '../../errors'
import type { AuthUserRepository } from '../../ports/AuthUserRepository'
import type { TokenService } from '../../ports/TokenService'

export type RegisterResult = {
  user: AuthUser
  token: string
}

function nameFromEmail(email: string) {
  const local = email.split('@')[0]?.trim()
  if (!local) return 'Usuário ByteBank'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export class RegisterUser {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly tokens: TokenService
  ) {}

  async execute(email: string, password: string): Promise<RegisterResult> {
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      throw new ValidationError('Preencha todos os campos.')
    }

    if (password.length < 6) {
      throw new ValidationError('A senha deve ter pelo menos 6 caracteres.')
    }

    const existing = await this.users.findByEmail(trimmedEmail)
    if (existing) throw new EmailAlreadyInUseError()

    const user = await this.users.create({
      email: trimmedEmail,
      password,
      name: nameFromEmail(trimmedEmail),
    })
    const token = await this.tokens.sign(user)
    return { user, token }
  }
}
