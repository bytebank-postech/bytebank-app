import { createTransactionUseCases } from '@bytebank/application'
import { InMemoryTransactionRepository } from '../transactions/InMemoryTransactionRepository'

let cached: ReturnType<typeof createTransactionUseCases> | null = null

export function createServerTransactionUseCases() {
  if (!cached) {
    cached = createTransactionUseCases(new InMemoryTransactionRepository())
  }
  return cached
}
