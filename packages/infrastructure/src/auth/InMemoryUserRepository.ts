import type {
  AuthUserRepository,
  CreateAuthUserInput,
} from '@bytebank/application'
import type { AuthUser } from '@bytebank/domain'
import { DEMO_USER_ID } from '../seed'
import { hashPassword, verifyPassword } from './passwordHasher'

type StoredUser = AuthUser & { passwordHash: string }

const seedUsers: StoredUser[] = [
  {
    id: DEMO_USER_ID,
    name: 'Usuário ByteBank',
    email: 'usuario@bytebank.com',
    passwordHash:
      'e6fefe51f71a5ea2084eaae5480d6193:590c2aa938f2d158225db19bfd00cd2cbdd214aa026413e4dddd325525be649ab55b0e0bdf000ec0d21932a061473610559a2763f07a4bbe86159097eba7cef6',
  },
]

// Comparado quando o e-mail não existe, para o tempo de resposta não revelar
// quais contas estão cadastradas.
const TIMING_FALLBACK_HASH = seedUsers[0].passwordHash

const globalStore = globalThis as unknown as {
  bytebankAuthUsers?: StoredUser[]
}

const users = globalStore.bytebankAuthUsers || [...seedUsers]

if (process.env.NODE_ENV !== 'production') {
  globalStore.bytebankAuthUsers = users
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const findStoredUser = (email: string) => {
  const normalized = normalizeEmail(email)
  return users.find((candidate) => normalizeEmail(candidate.email) === normalized)
}

const toAuthUser = ({ id, name, email }: StoredUser): AuthUser => ({
  id,
  name,
  email,
})

export class InMemoryUserRepository implements AuthUserRepository {
  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = findStoredUser(email)
    return user ? toAuthUser(user) : null
  }

  async findByEmailAndPassword(
    email: string,
    password: string
  ): Promise<AuthUser | null> {
    const user = findStoredUser(email)
    const passwordMatches = await verifyPassword(
      password,
      user?.passwordHash ?? TIMING_FALLBACK_HASH
    )
    if (!user || !passwordMatches) return null
    return toAuthUser(user)
  }

  async create(input: CreateAuthUserInput): Promise<AuthUser> {
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: input.email.trim(),
      name: input.name,
      passwordHash: await hashPassword(input.password),
    }
    users.push(user)
    return toAuthUser(user)
  }
}
