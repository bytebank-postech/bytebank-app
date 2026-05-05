import transactionsData from '@/data/transactions.json'
import { Transaction } from '@/types/transaction'

const globalStore = global as unknown as { transactions: Transaction[] }
export const transactions =
  globalStore.transactions || (transactionsData as Transaction[])
if (process.env.NODE_ENV !== 'production') {
  globalStore.transactions = transactions
}
