import { describe, expect, it } from 'vitest'
import { LoginAttemptLimiter } from './LoginAttemptLimiter'

const createClock = (start = 0) => {
  let current = start
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms
    },
  }
}

describe('LoginAttemptLimiter', () => {
  it('bloqueia após atingir o limite de falhas', () => {
    const clock = createClock()
    const limiter = new LoginAttemptLimiter({
      maxFailures: 3,
      windowMs: 60_000,
      now: clock.now,
    })

    limiter.registerFailure('ada@bytebank.dev')
    limiter.registerFailure('ada@bytebank.dev')
    expect(limiter.retryAfterSeconds('ada@bytebank.dev')).toBe(0)

    limiter.registerFailure('ada@bytebank.dev')
    expect(limiter.retryAfterSeconds('ada@bytebank.dev')).toBe(60)
    expect(limiter.retryAfterSeconds('outra@bytebank.dev')).toBe(0)
  })

  it('libera novamente quando a janela expira', () => {
    const clock = createClock()
    const limiter = new LoginAttemptLimiter({
      maxFailures: 1,
      windowMs: 60_000,
      now: clock.now,
    })

    limiter.registerFailure('ada@bytebank.dev')
    clock.advance(60_000)

    expect(limiter.retryAfterSeconds('ada@bytebank.dev')).toBe(0)
  })

  it('zera o contador após login bem-sucedido', () => {
    const limiter = new LoginAttemptLimiter({ maxFailures: 2 })

    limiter.registerFailure('ada@bytebank.dev')
    limiter.reset('ada@bytebank.dev')
    limiter.registerFailure('ada@bytebank.dev')

    expect(limiter.retryAfterSeconds('ada@bytebank.dev')).toBe(0)
  })
})
