import type { TransactionRepository } from '../../ports/TransactionRepository'

export class DeleteTransaction {
  constructor(private readonly repository: TransactionRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}
