import type {
  Transaction,
  TransactionAttachment,
  TransactionType,
} from '@bytebank/domain'

export type TransactionPage = {
  items: Transaction[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type TransactionPageFilters = {
  page: number
  pageSize: number
  search?: string
  type?: TransactionType
  month?: string
}

export type AttachmentUpload = {
  name: string
  mimeType: string
  size: number
  content: ArrayBuffer
}

export type StoredAttachmentContent = {
  name: string
  mimeType: string
  content: Uint8Array
}

export interface TransactionRepository {
  list(): Promise<Transaction[]>
  getById(id: string): Promise<Transaction | null>
  getPage(filters: TransactionPageFilters): Promise<TransactionPage>
  create(data: Omit<Transaction, 'id'>): Promise<Transaction>
  update(id: string, data: Partial<Transaction>): Promise<Transaction | null>
  delete(id: string): Promise<void>
  listAttachments(
    transactionId: string
  ): Promise<TransactionAttachment[] | null>
  addAttachments(
    transactionId: string,
    files: AttachmentUpload[]
  ): Promise<TransactionAttachment[] | null>
  removeAttachment(
    transactionId: string,
    attachmentId: string
  ): Promise<boolean>
  getAttachmentContent(
    transactionId: string,
    attachmentId: string
  ): Promise<StoredAttachmentContent | null>
}
