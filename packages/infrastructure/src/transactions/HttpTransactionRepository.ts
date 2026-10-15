import type {
  AttachmentUpload,
  StoredAttachmentContent,
  TransactionPage,
  TransactionPageFilters,
  TransactionRepository,
} from '@bytebank/application'
import type { Transaction, TransactionAttachment } from '@bytebank/domain'

export class HttpTransactionRepository implements TransactionRepository {
  constructor(private readonly baseUrl = '/api/transactions') {}

  async list(): Promise<Transaction[]> {
    const response = await fetch(this.baseUrl)
    if (!response.ok) {
      throw new Error('Não foi possível carregar as transações.')
    }
    return response.json()
  }

  async getById(id: string): Promise<Transaction | null> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error('Não foi possível carregar a transação.')
    }
    return response.json()
  }

  async getPage(filters: TransactionPageFilters): Promise<TransactionPage> {
    const params = new URLSearchParams({
      page: String(filters.page),
      pageSize: String(filters.pageSize),
    })
    if (filters.search) params.set('search', filters.search)
    if (filters.type) params.set('type', filters.type)
    if (filters.month) params.set('month', filters.month)

    const response = await fetch(`${this.baseUrl}?${params}`)
    if (!response.ok) {
      throw new Error('Não foi possível carregar as transações.')
    }
    return response.json()
  }

  async create(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Não foi possível criar a transação.')
    }
    return response.json()
  }

  async update(
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction | null> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error('Não foi possível atualizar a transação.')
    }
    return response.json()
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      throw new Error('Não foi possível excluir a transação.')
    }
  }

  async listAttachments(
    transactionId: string
  ): Promise<TransactionAttachment[] | null> {
    const response = await fetch(`${this.baseUrl}/${transactionId}/attachments`)
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error('Não foi possível carregar os anexos.')
    }
    return response.json()
  }

  async addAttachments(
    transactionId: string,
    files: AttachmentUpload[]
  ): Promise<TransactionAttachment[] | null> {
    if (files.length === 0) return []
    const formData = new FormData()
    for (const file of files) {
      formData.append(
        'files',
        new File([file.content], file.name, { type: file.mimeType })
      )
    }
    const response = await fetch(
      `${this.baseUrl}/${transactionId}/attachments`,
      {
        method: 'POST',
        body: formData,
      }
    )
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error('Não foi possível enviar os anexos.')
    }
    return response.json()
  }

  async removeAttachment(
    transactionId: string,
    attachmentId: string
  ): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/${transactionId}/attachments/${attachmentId}`,
      { method: 'DELETE' }
    )
    if (response.status === 404) return false
    if (!response.ok) {
      throw new Error('Não foi possível remover o anexo.')
    }
    return true
  }

  async getAttachmentContent(
    transactionId: string,
    attachmentId: string
  ): Promise<StoredAttachmentContent | null> {
    const response = await fetch(
      `${this.baseUrl}/${transactionId}/attachments/${attachmentId}`
    )
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error('Não foi possível carregar o anexo.')
    }
    const buffer = await response.arrayBuffer()
    return {
      name: attachmentId,
      mimeType:
        response.headers.get('Content-Type') ?? 'application/octet-stream',
      content: new Uint8Array(buffer),
    }
  }
}

export async function filesToAttachmentUploads(
  files: File[]
): Promise<AttachmentUpload[]> {
  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      mimeType: file.type,
      size: file.size,
      content: await file.arrayBuffer(),
    }))
  )
}
