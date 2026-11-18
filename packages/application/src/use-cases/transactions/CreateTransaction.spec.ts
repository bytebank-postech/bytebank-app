import { describe, expect, it } from 'vitest'
import type { Transaction } from '@bytebank/domain'
import type {
  AttachmentUpload,
  StoredAttachmentContent,
  TransactionPage,
  TransactionPageFilters,
  TransactionRepository,
} from '../../ports/TransactionRepository'
import { CreateTransaction } from './CreateTransaction'

class FakeTransactionRepository implements TransactionRepository {
  items: Transaction[] = []

  async list() {
    return this.items
  }

  async getById(id: string) {
    return this.items.find((item) => item.id === id) ?? null
  }

  async getPage(_filters: TransactionPageFilters): Promise<TransactionPage> {
    return {
      items: this.items,
      total: this.items.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }
  }

  async create(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    const created = {
      ...data,
      id: 'generated-id',
      attachments: data.attachments ?? [],
    }
    this.items.push(created)
    return created
  }

  async update() {
    return null
  }

  async delete() {}

  async listAttachments() {
    return []
  }

  async addAttachments(_id: string, _files: AttachmentUpload[]) {
    return []
  }

  async removeAttachment() {
    return false
  }

  async getAttachmentContent(): Promise<StoredAttachmentContent | null> {
    return null
  }
}

describe('CreateTransaction', () => {
  it('persists a transaction with empty attachments by default', async () => {
    const repository = new FakeTransactionRepository()
    const useCase = new CreateTransaction(repository)

    const created = await useCase.execute({
      type: 'Depósito',
      name: 'Salário',
      amount: 1000,
      date: '2026-01-01',
      category: 'Salário',
    })

    expect(created.id).toBe('generated-id')
    expect(created.attachments).toEqual([])
    expect(repository.items).toHaveLength(1)
  })
})
