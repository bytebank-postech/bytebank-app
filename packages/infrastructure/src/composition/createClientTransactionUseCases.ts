import { createTransactionUseCases } from '@bytebank/application'
import { HttpTransactionRepository } from '../transactions/HttpTransactionRepository'

let cached: ReturnType<typeof createTransactionUseCases> | null = null

export function createClientTransactionUseCases() {
  if (!cached) {
    cached = createTransactionUseCases(new HttpTransactionRepository())
  }
  return cached
}
