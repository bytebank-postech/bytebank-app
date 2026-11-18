import { createTransactionUseCases } from '@bytebank/application'
import { InMemoryTransactionRepository } from '../transactions/InMemoryTransactionRepository'

export function createServerTransactionUseCases(ownerId: string) {
  return createTransactionUseCases(new InMemoryTransactionRepository(ownerId))
}
