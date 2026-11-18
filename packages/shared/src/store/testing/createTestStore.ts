import type {
  AttachmentUpload,
  SessionGateway,
  TransactionPage,
  TransactionPageFilters,
  TransactionUseCases,
} from '@bytebank/application'
import type { AuthUser, Transaction } from '@bytebank/domain'
import { makeStore, type MakeStoreOptions } from '../makeStore'
import type { AppExtra } from '../types'

type UseCaseStub<T> = { execute: (...args: never[]) => Promise<T> }

function stub<T>(value: T): UseCaseStub<T> {
  return { execute: () => Promise.resolve(value) }
}

function paginate(
  items: Transaction[],
  { page, pageSize }: TransactionPageFilters
): TransactionPage {
  const start = (page - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  }
}

export function createFakeTransactionUseCases(
  items: Transaction[] = [],
  overrides: Partial<TransactionUseCases> = {}
): TransactionUseCases {
  return {
    listTransactions: stub(items),
    getTransactionPage: {
      execute: (filters: TransactionPageFilters) =>
        Promise.resolve(paginate(items, filters)),
    },
    getTransactionById: stub(items[0] ?? null),
    createTransaction: {
      execute: (data: Omit<Transaction, 'id'>) =>
        Promise.resolve({ ...data, id: `tx-${items.length + 1}` }),
    },
    updateTransaction: {
      execute: (id: string, data: Partial<Transaction>) =>
        Promise.resolve({ ...(items.find((item) => item.id === id) as Transaction), ...data }),
    },
    deleteTransaction: stub(undefined),
    listTransactionAttachments: stub([]),
    addTransactionAttachments: stub([]),
    removeTransactionAttachment: stub(undefined),
    getAttachmentContent: stub(null),
    ...overrides,
  } as unknown as TransactionUseCases
}

export function createFakeSessionGateway(
  user: AuthUser | null = null,
  overrides: Partial<SessionGateway> = {}
): SessionGateway {
  return {
    login: () => Promise.resolve(user as AuthUser),
    register: () => Promise.resolve(user as AuthUser),
    logout: () => Promise.resolve(),
    getSession: () => Promise.resolve(user),
    ...overrides,
  }
}

export function createTestExtra(overrides: Partial<AppExtra> = {}): AppExtra {
  return {
    transactions: createFakeTransactionUseCases(),
    session: createFakeSessionGateway(),
    toAttachmentUploads: () => Promise.resolve([] as AttachmentUpload[]),
    ...overrides,
  }
}

export function createTestStore(options: MakeStoreOptions = {}) {
  return makeStore({ extra: createTestExtra(), ...options })
}
