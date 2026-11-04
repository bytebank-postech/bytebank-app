'use client'

import { useCallback } from 'react'
import { useAppSelector } from '../store/hooks'
import { selectSessionUser } from '../store/selectors/sessionSelectors'
import { prefetchTransactionNavigation } from '../cache/transactionNavigationCache'

export function useTransactionNavigationPrefetch() {
  const userId = useAppSelector(selectSessionUser)?.id
  return useCallback(() => {
    if (userId) void prefetchTransactionNavigation(userId)
  }, [userId])
}
