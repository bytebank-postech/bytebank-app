import { createAuthUseCases as buildAuthUseCases } from '@bytebank/application'
import { InMemoryUserRepository } from '../auth/InMemoryUserRepository'
import { JwtTokenService } from '../auth/JwtTokenService'

let cached: ReturnType<typeof buildAuthUseCases> | null = null

export function createAuthUseCases() {
  if (!cached) {
    cached = buildAuthUseCases(
      new InMemoryUserRepository(),
      new JwtTokenService()
    )
  }
  return cached
}

export function createTokenService() {
  return new JwtTokenService()
}
