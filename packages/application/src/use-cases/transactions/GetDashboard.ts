import { buildDashboardSummary, type DashboardSummary } from '@bytebank/domain'
import type { TransactionRepository } from '../../ports/TransactionRepository'

export class GetDashboard {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(signal?: AbortSignal): Promise<DashboardSummary> {
    if (this.repository.getDashboard) return this.repository.getDashboard(signal)
    return buildDashboardSummary(await this.repository.list(signal))
  }
}
