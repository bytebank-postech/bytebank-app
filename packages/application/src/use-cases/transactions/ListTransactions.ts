import type { Transaction } from '@bytebank/domain'
import type { TransactionRepository } from '../../ports/TransactionRepository'

export class ListTransactions {
  constructor(private readonly repository: TransactionRepository) {}

  execute(): Promise<Transaction[]> {
    return this.repository.list()
  }
}
