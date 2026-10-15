import type { Transaction } from '@bytebank/domain'
import transactionsData from './data/transactions.json'

export type StoredAttachment = {
  transactionId: string
  name: string
  mimeType: string
  content: Buffer
}

const globalStore = globalThis as unknown as {
  bytebankTransactions?: Transaction[]
  bytebankAttachments?: Map<string, StoredAttachment>
}

export const transactions =
  globalStore.bytebankTransactions || (transactionsData as Transaction[])

export const attachments =
  globalStore.bytebankAttachments || new Map<string, StoredAttachment>()

if (process.env.NODE_ENV !== 'production') {
  globalStore.bytebankTransactions = transactions
  globalStore.bytebankAttachments = attachments
}
