'use client'

import { useAppSelector } from '../store/hooks'
import {
  selectBalance,
  selectMonthlyFlow,
  selectStatementPreview,
  selectTypeDistribution,
} from '../store/selectors/transactionsSelectors'

export function useDashboardAnalytics() {
  return {
    balance: useAppSelector(selectBalance),
    monthlyFlow: useAppSelector(selectMonthlyFlow),
    typeDistribution: useAppSelector(selectTypeDistribution),
    statementPreview: useAppSelector(selectStatementPreview),
  }
}
