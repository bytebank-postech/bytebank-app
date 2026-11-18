type AttemptWindow = {
  failures: number
  resetAt: number
}

export type LoginAttemptLimiterOptions = {
  maxFailures?: number
  windowMs?: number
  now?: () => number
}

export class LoginAttemptLimiter {
  private readonly attempts = new Map<string, AttemptWindow>()
  private readonly maxFailures: number
  private readonly windowMs: number
  private readonly now: () => number

  constructor({
    maxFailures = 5,
    windowMs = 15 * 60_000,
    now = Date.now,
  }: LoginAttemptLimiterOptions = {}) {
    this.maxFailures = maxFailures
    this.windowMs = windowMs
    this.now = now
  }

  retryAfterSeconds(key: string): number {
    const window = this.read(key)
    if (!window || window.failures < this.maxFailures) return 0
    return Math.ceil((window.resetAt - this.now()) / 1000)
  }

  registerFailure(key: string): void {
    this.pruneExpired()
    const window = this.read(key)
    if (window) {
      window.failures += 1
      return
    }
    this.attempts.set(key, { failures: 1, resetAt: this.now() + this.windowMs })
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }

  private read(key: string): AttemptWindow | undefined {
    const window = this.attempts.get(key)
    if (!window) return undefined
    if (window.resetAt > this.now()) return window
    this.attempts.delete(key)
    return undefined
  }

  private pruneExpired(): void {
    const now = this.now()
    for (const [key, window] of this.attempts) {
      if (window.resetAt <= now) this.attempts.delete(key)
    }
  }
}
