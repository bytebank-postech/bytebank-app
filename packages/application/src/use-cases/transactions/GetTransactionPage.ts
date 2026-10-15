import type {
  TransactionPage,
  TransactionPageFilters,
  TransactionRepository,
} from '../../ports/TransactionRepository'

export class GetTransactionPage {
  constructor(private readonly repository: TransactionRepository) {}

  execute(filters: TransactionPageFilters): Promise<TransactionPage> {
    return this.repository.getPage(filters)
  }
}
