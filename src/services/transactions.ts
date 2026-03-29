import { Transaction } from '@/types/transaction'

const BASE_URL = '/api/transactions'

export async function getTransactions(): Promise<Transaction[]> {
  const response = await fetch(BASE_URL)
  return response.json()
}

export async function getTransactionById(id: string): Promise<Transaction> {
  const response = await fetch(`${BASE_URL}/${id}`)
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
  return response.json()
}

export async function deleteTransaction(id: string): Promise<void> {
  await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
}
