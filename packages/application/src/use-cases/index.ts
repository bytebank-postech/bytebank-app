import type { AuthUserRepository } from '../ports/AuthUserRepository'
import type { TokenService } from '../ports/TokenService'
import type { TransactionRepository } from '../ports/TransactionRepository'
import { GetSession } from './auth/GetSession'
import { LoginUser } from './auth/LoginUser'
import { RegisterUser } from './auth/RegisterUser'
import { AddTransactionAttachments } from './transactions/AddTransactionAttachments'
import { CreateTransaction } from './transactions/CreateTransaction'
import { DeleteTransaction } from './transactions/DeleteTransaction'
import { GetAttachmentContent } from './transactions/GetAttachmentContent'
import { GetTransactionById } from './transactions/GetTransactionById'
import { GetTransactionPage } from './transactions/GetTransactionPage'
import { ListTransactionAttachments } from './transactions/ListTransactionAttachments'
import { ListTransactions } from './transactions/ListTransactions'
import { RemoveTransactionAttachment } from './transactions/RemoveTransactionAttachment'
import { UpdateTransaction } from './transactions/UpdateTransaction'

export function createTransactionUseCases(repository: TransactionRepository) {
  return {
    listTransactions: new ListTransactions(repository),
    getTransactionPage: new GetTransactionPage(repository),
    getTransactionById: new GetTransactionById(repository),
    createTransaction: new CreateTransaction(repository),
    updateTransaction: new UpdateTransaction(repository),
    deleteTransaction: new DeleteTransaction(repository),
    listTransactionAttachments: new ListTransactionAttachments(repository),
    addTransactionAttachments: new AddTransactionAttachments(repository),
    removeTransactionAttachment: new RemoveTransactionAttachment(repository),
    getAttachmentContent: new GetAttachmentContent(repository),
  }
}

export type TransactionUseCases = ReturnType<typeof createTransactionUseCases>

export function createAuthUseCases(
  users: AuthUserRepository,
  tokens: TokenService
) {
  return {
    loginUser: new LoginUser(users, tokens),
    registerUser: new RegisterUser(users, tokens),
    getSession: new GetSession(tokens),
  }
}

export type AuthUseCases = ReturnType<typeof createAuthUseCases>

export {
  AddTransactionAttachments,
  CreateTransaction,
  DeleteTransaction,
  GetAttachmentContent,
  GetSession,
  GetTransactionById,
  GetTransactionPage,
  ListTransactionAttachments,
  ListTransactions,
  LoginUser,
  RegisterUser,
  RemoveTransactionAttachment,
  UpdateTransaction,
}
