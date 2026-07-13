import { Transaction, TransactionAttachment, TransactionType } from '../types/transaction'

const BASE_URL = '/api/transactions'

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

export async function getTransactions(): Promise<Transaction[]> {
  const response = await fetch(BASE_URL)
  if (!response.ok) {
    throw new Error('Não foi possível carregar as transações.')
  }
  return response.json()
}

export async function getTransactionById(id: string): Promise<Transaction> {
  const response = await fetch(`${BASE_URL}/${id}`)
  if (!response.ok) {
    throw new Error('Não foi possível carregar a transação.')
  }
  return response.json()
}

export async function getTransactionPage(
  filters: TransactionPageFilters
): Promise<TransactionPage> {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  })
  if (filters.search) params.set('search', filters.search)
  if (filters.type) params.set('type', filters.type)
  if (filters.month) params.set('month', filters.month)

  const response = await fetch(`${BASE_URL}?${params}`)
  if (!response.ok) throw new Error('Não foi possível carregar as transações.')
  return response.json()
}

export async function createTransaction(
  transaction: Omit<Transaction, 'id'>
): Promise<Transaction> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  })
  if (!response.ok) {
    throw new Error('Não foi possível criar a transação.')
  }
  return response.json()
}

export async function updateTransaction(
  id: string,
  transaction: Partial<Transaction>
): Promise<Transaction> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  })
  if (!response.ok) {
    throw new Error('Não foi possível atualizar a transação.')
  }
  return response.json()
}

export async function deleteTransaction(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error('Não foi possível excluir a transação.')
  }
}

export async function uploadTransactionAttachments(
  transactionId: string,
  files: File[]
): Promise<TransactionAttachment[]> {
  if (files.length === 0) return []
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const response = await fetch(`${BASE_URL}/${transactionId}/attachments`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error('Não foi possível enviar os anexos.')
  return response.json()
}

export async function deleteTransactionAttachment(
  transactionId: string,
  attachmentId: string
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/${transactionId}/attachments/${attachmentId}`,
    { method: 'DELETE' }
  )
  if (!response.ok) throw new Error('Não foi possível remover o anexo.')
}
