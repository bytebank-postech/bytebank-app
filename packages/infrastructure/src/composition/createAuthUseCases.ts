import { createAuthUseCases as buildAuthUseCases } from '@bytebank/application'
import { InMemoryUserRepository } from '../auth/InMemoryUserRepository'
import { JwtTokenService } from '../auth/JwtTokenService'
import { LoginAttemptLimiter } from '../auth/LoginAttemptLimiter'

let cached: ReturnType<typeof buildAuthUseCases> | null = null
let cachedLimiter: LoginAttemptLimiter | null = null

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

export function createLoginAttemptLimiter() {
  if (!cachedLimiter) {
    cachedLimiter = new LoginAttemptLimiter()
  }
  return cachedLimiter
}
