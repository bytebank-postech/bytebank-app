import transactionsData from './transactions.json'
import { Transaction } from '@bytebank/shared'

const globalStore = global as unknown as { transactions: Transaction[] }
export const transactions =
  globalStore.transactions || (transactionsData as Transaction[])
if (process.env.NODE_ENV !== 'production') {
  globalStore.transactions = transactions
}
