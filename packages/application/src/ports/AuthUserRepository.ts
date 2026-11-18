import type { AuthUser } from '@bytebank/domain'

export type CreateAuthUserInput = {
  email: string
  password: string
  name: string
}

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>
  findByEmailAndPassword(
    email: string,
    password: string
  ): Promise<AuthUser | null>
  create(input: CreateAuthUserInput): Promise<AuthUser>
}
