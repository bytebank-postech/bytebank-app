import type {
  AttachmentUpload,
  StoredAttachmentContent,
  TransactionPage,
  TransactionPageFilters,
  TransactionRepository,
} from '@bytebank/application'
import type { Transaction, TransactionAttachment } from '@bytebank/domain'
import { attachments, transactions } from './inMemoryStore'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function createId() {
  return crypto.randomUUID()
}

export class InMemoryTransactionRepository implements TransactionRepository {
  async list(): Promise<Transaction[]> {
    return transactions
  }

  async getById(id: string): Promise<Transaction | null> {
    return transactions.find((item) => item.id === id) ?? null
  }

  async getPage(filters: TransactionPageFilters): Promise<TransactionPage> {
    const page = Math.max(1, filters.page || 1)
    const pageSize = Math.min(50, Math.max(1, filters.pageSize || 10))
    const search = normalize(filters.search ?? '')
    const type = filters.type
    const month = filters.month

    const filtered = transactions
      .filter((transaction) => {
        const matchesSearch =
          !search ||
          normalize(transaction.name).includes(search) ||
          normalize(transaction.type).includes(search) ||
          normalize(transaction.category ?? '').includes(search)
        const matchesType = !type || transaction.type === type
        const matchesMonth = !month || transaction.date.startsWith(`${month}-`)
        return matchesSearch && matchesType && matchesMonth
      })
      .sort((first, second) => second.date.localeCompare(first.date))

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const currentPage = Math.min(page, totalPages)
    const start = (currentPage - 1) * pageSize

    return {
      items: filtered.slice(start, start + pageSize),
      total,
      page: currentPage,
      pageSize,
      totalPages,
    }
  }

  async create(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...data,
      id: createId(),
      attachments: data.attachments ?? [],
    }
    transactions.push(newTransaction)
    return newTransaction
  }

  async update(
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction | null> {
    const index = transactions.findIndex((item) => item.id === id)
    if (index === -1) return null
    transactions[index] = { ...transactions[index], ...data, id }
    return transactions[index]
  }

  async delete(id: string): Promise<void> {
    const index = transactions.findIndex((item) => item.id === id)
    if (index !== -1) transactions.splice(index, 1)
  }

  async listAttachments(
    transactionId: string
  ): Promise<TransactionAttachment[] | null> {
    const transaction = transactions.find((item) => item.id === transactionId)
    if (!transaction) return null
    return transaction.attachments ?? []
  }

  async addAttachments(
    transactionId: string,
    files: AttachmentUpload[]
  ): Promise<TransactionAttachment[] | null> {
    const transaction = transactions.find((item) => item.id === transactionId)
    if (!transaction) return null

    const created = files.map((file) => {
      const attachmentId = createId()
      const metadata: TransactionAttachment = {
        id: attachmentId,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        url: `/api/transactions/${transactionId}/attachments/${attachmentId}`,
      }
      attachments.set(attachmentId, {
        transactionId,
        name: file.name,
        mimeType: file.mimeType,
        content: Buffer.from(file.content),
      })
      return metadata
    })

    transaction.attachments = [...(transaction.attachments ?? []), ...created]
    return created
  }

  async removeAttachment(
    transactionId: string,
    attachmentId: string
  ): Promise<boolean> {
    const transaction = transactions.find((item) => item.id === transactionId)
    const attachment = attachments.get(attachmentId)
    if (
      !transaction ||
      !attachment ||
      attachment.transactionId !== transactionId
    ) {
      return false
    }

    attachments.delete(attachmentId)
    transaction.attachments = (transaction.attachments ?? []).filter(
      (item) => item.id !== attachmentId
    )
    return true
  }

  async getAttachmentContent(
    transactionId: string,
    attachmentId: string
  ): Promise<StoredAttachmentContent | null> {
    const attachment = attachments.get(attachmentId)
    if (!attachment || attachment.transactionId !== transactionId) return null
    return {
      name: attachment.name,
      mimeType: attachment.mimeType,
      content: new Uint8Array(attachment.content),
    }
  }
}
