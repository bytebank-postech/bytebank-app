import {
  createClientSessionGateway,
  createClientTransactionUseCases,
  filesToAttachmentUploads,
} from '@bytebank/infrastructure/client'
import type { AppExtra } from './types'

export function createAppExtra(overrides: Partial<AppExtra> = {}): AppExtra {
  return {
    transactions: createClientTransactionUseCases(),
    session: createClientSessionGateway(),
    toAttachmentUploads: filesToAttachmentUploads,
    ...overrides,
  }
}
