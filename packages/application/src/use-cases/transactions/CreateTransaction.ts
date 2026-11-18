import type { Transaction } from '@bytebank/domain'
import type { TransactionRepository } from '../../ports/TransactionRepository'

export class CreateTransaction {
  constructor(private readonly repository: TransactionRepository) {}

  execute(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    return this.repository.create({
      ...data,
      attachments: data.attachments ?? [],
    })
  }
}
