import type {
  AuthUserRepository,
  CreateAuthUserInput,
} from '@bytebank/application'
import type { AuthUser } from '@bytebank/domain'

type StoredUser = CreateAuthUserInput & { id: string }

const seedUsers: StoredUser[] = [
  {
    id: '1',
    name: 'Usuário ByteBank',
    email: 'usuario@bytebank.com',
    password: 'senha123',
  },
]

const globalStore = globalThis as unknown as {
  bytebankUsers?: StoredUser[]
}

const users = globalStore.bytebankUsers || [...seedUsers]

if (process.env.NODE_ENV !== 'production') {
  globalStore.bytebankUsers = users
}

function toAuthUser(user: StoredUser): AuthUser {
  return { id: user.id, name: user.name, email: user.email }
}

export class InMemoryUserRepository implements AuthUserRepository {
  async findByEmail(email: string): Promise<AuthUser | null> {
    const normalized = email.trim().toLowerCase()
    const user = users.find(
      (candidate) => candidate.email.toLowerCase() === normalized
    )
    return user ? toAuthUser(user) : null
  }

  async findByEmailAndPassword(
    email: string,
    password: string
  ): Promise<AuthUser | null> {
    const normalized = email.trim().toLowerCase()
    const user = users.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalized &&
        candidate.password === password
    )
    return user ? toAuthUser(user) : null
  }

  async create(input: CreateAuthUserInput): Promise<AuthUser> {
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: input.email.trim(),
      password: input.password,
      name: input.name,
    }
    users.push(user)
    return toAuthUser(user)
  }
}
