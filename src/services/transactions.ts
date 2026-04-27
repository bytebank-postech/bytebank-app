import { Transaction } from '@/types/transaction'

const BASE_URL = '/api/transactions'

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
