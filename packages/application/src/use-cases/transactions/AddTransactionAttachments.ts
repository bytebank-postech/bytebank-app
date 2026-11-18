import type { TransactionAttachment } from '@bytebank/domain'
import { isValidAttachment } from '@bytebank/domain'
import { NotFoundError, ValidationError } from '../../errors'
import type {
  AttachmentUpload,
  TransactionRepository,
} from '../../ports/TransactionRepository'

export class AddTransactionAttachments {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(
    transactionId: string,
    files: AttachmentUpload[]
  ): Promise<TransactionAttachment[]> {
    if (files.length === 0) {
      throw new ValidationError('Nenhum arquivo enviado.')
    }

    for (const file of files) {
      if (!isValidAttachment(file.mimeType, file.size)) {
        throw new ValidationError(
          'Envie arquivos PDF, PNG ou JPEG de até 5 MB.'
        )
      }
    }

    const created = await this.repository.addAttachments(transactionId, files)
    if (!created) throw new NotFoundError('Transação não encontrada.')
    return created
  }
}
