import type { TransactionPageFilters } from '@bytebank/application'

export const transactionQueryKeys = {
  forUser: (userId: string) => ['transactions', userId] as const,
  all: (userId: string) => ['transactions', userId, 'all'] as const,
  page: (userId: string, filters: TransactionPageFilters) =>
    ['transactions', userId, 'page', filters] as const,
}
