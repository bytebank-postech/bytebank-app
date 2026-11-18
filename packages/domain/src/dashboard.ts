import type { Transaction } from './transaction'
import { totalBalance } from './model'
import { buildMonthlyFlow, buildTypeDistribution, previewMonthGroups } from './analytics'

export function buildDashboardSummary(transactions: Transaction[]) {
  return {
    balance: totalBalance(transactions),
    total: transactions.length,
    statementPreview: previewMonthGroups(transactions, 5),
    monthlyFlow: buildMonthlyFlow(transactions),
    typeDistribution: buildTypeDistribution(transactions),
  }
}

export type DashboardSummary = ReturnType<typeof buildDashboardSummary>
