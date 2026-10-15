import { describe, expect, it } from 'vitest'
import type { AuthUser } from '@bytebank/domain'
import type {
  AuthUserRepository,
  CreateAuthUserInput,
} from '../../ports/AuthUserRepository'
import type { TokenService } from '../../ports/TokenService'
import { RegisterUser } from './RegisterUser'

class FakeUsers implements AuthUserRepository {
  items: Array<CreateAuthUserInput & { id: string }> = []

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)
    return user ? { id: user.id, name: user.name, email: user.email } : null
  }

  async findByEmailAndPassword() {
    return null
  }

  async create(input: CreateAuthUserInput): Promise<AuthUser> {
    const user = { ...input, id: 'new-id' }
    this.items.push(user)
    return { id: user.id, name: user.name, email: user.email }
  }
}

class FakeTokens implements TokenService {
  async sign(user: AuthUser) {
    return `token-for-${user.id}`
  }

  async verify() {
    return null
  }
}

describe('RegisterUser', () => {
  it('creates a user and returns a token', async () => {
    const useCase = new RegisterUser(new FakeUsers(), new FakeTokens())
    const result = await useCase.execute('novo@bytebank.com', 'senha123')

    expect(result.user.email).toBe('novo@bytebank.com')
    expect(result.token).toBe('token-for-new-id')
  })

  it('rejects weak passwords', async () => {
    const useCase = new RegisterUser(new FakeUsers(), new FakeTokens())
    await expect(useCase.execute('novo@bytebank.com', '123')).rejects.toThrow(
      'A senha deve ter pelo menos 6 caracteres.'
    )
  })
})
