import type { TransactionAttachment } from '@bytebank/domain'
import { NotFoundError } from '../../errors'
import type { TransactionRepository } from '../../ports/TransactionRepository'

export class ListTransactionAttachments {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(transactionId: string): Promise<TransactionAttachment[]> {
    const attachments = await this.repository.listAttachments(transactionId)
    if (!attachments) throw new NotFoundError('Transação não encontrada.')
    return attachments
  }
}
