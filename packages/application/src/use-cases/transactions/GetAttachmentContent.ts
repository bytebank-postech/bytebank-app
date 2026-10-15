import { NotFoundError } from '../../errors'
import type {
  StoredAttachmentContent,
  TransactionRepository,
} from '../../ports/TransactionRepository'

export class GetAttachmentContent {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(
    transactionId: string,
    attachmentId: string
  ): Promise<StoredAttachmentContent> {
    const attachment = await this.repository.getAttachmentContent(
      transactionId,
      attachmentId
    )
    if (!attachment) throw new NotFoundError('Anexo não encontrado.')
    return attachment
  }
}
