import { NotFoundError } from '../../errors'
import type { TransactionRepository } from '../../ports/TransactionRepository'

export class RemoveTransactionAttachment {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(transactionId: string, attachmentId: string): Promise<void> {
    const removed = await this.repository.removeAttachment(
      transactionId,
      attachmentId
    )
    if (!removed) throw new NotFoundError('Anexo não encontrado.')
  }
}
