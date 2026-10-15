import type { Transaction } from '@bytebank/domain'
import { NotFoundError } from '../../errors'
import type { TransactionRepository } from '../../ports/TransactionRepository'

export class GetTransactionById {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(id: string): Promise<Transaction> {
    const transaction = await this.repository.getById(id)
    if (!transaction) throw new NotFoundError('Transação não encontrada.')
    return transaction
  }
}
