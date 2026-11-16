import type { Transaction } from '@bytebank/domain'
import { DEMO_USER_ID } from '../seed'
import transactionsData from './data/transactions.json'

export type StoredTransaction = Transaction & { ownerId: string }

export type StoredAttachment = {
  transactionId: string
  name: string
  mimeType: string
  content: Buffer
}

const globalStore = globalThis as unknown as {
  bytebankOwnedTransactions?: StoredTransaction[]
  bytebankAttachments?: Map<string, StoredAttachment>
}

const seedTransactions = (transactionsData as Transaction[]).map(
  (transaction): StoredTransaction => ({
    ...transaction,
    ownerId: DEMO_USER_ID,
  })
)

export const transactions =
  globalStore.bytebankOwnedTransactions || seedTransactions

export const attachments =
  globalStore.bytebankAttachments || new Map<string, StoredAttachment>()

if (process.env.NODE_ENV !== 'production') {
  globalStore.bytebankOwnedTransactions = transactions
  globalStore.bytebankAttachments = attachments
}
