import transactionsData from './transactions.json'
import { Transaction } from '@bytebank/shared'

export type StoredAttachment = {
  transactionId: string
  name: string
  mimeType: string
  content: Buffer
}

const globalStore = global as unknown as {
  transactions: Transaction[]
  attachments: Map<string, StoredAttachment>
}
export const transactions =
  globalStore.transactions || (transactionsData as Transaction[])
export const attachments = globalStore.attachments || new Map<string, StoredAttachment>()
if (process.env.NODE_ENV !== 'production') {
  globalStore.transactions = transactions
  globalStore.attachments = attachments
}
