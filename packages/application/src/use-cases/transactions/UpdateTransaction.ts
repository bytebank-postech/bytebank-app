import type { Transaction } from '@bytebank/domain'
import { NotFoundError } from '../../errors'
import type { TransactionRepository } from '../../ports/TransactionRepository'

export class UpdateTransaction {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const updated = await this.repository.update(id, data)
    if (!updated) throw new NotFoundError('Transação não encontrada.')
    return updated
  }
}
