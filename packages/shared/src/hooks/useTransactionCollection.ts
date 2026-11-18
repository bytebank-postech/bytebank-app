'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  loadAllTransactions,
  loadTransactionPage,
  type TransactionCollectionView,
} from '../store/slices/transactionsSlice'
import {
  selectListError,
  selectListStatus,
  selectTotalItems,
  selectTotalPages,
  selectVisibleMonthGroups,
  selectVisibleTransactions,
} from '../store/selectors/transactionsSelectors'

export function useTransactionCollection(view: TransactionCollectionView) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const request =
      view === 'all'
        ? dispatch(loadAllTransactions())
        : dispatch(loadTransactionPage())

    return () => {
      request.abort()
    }
  }, [dispatch, view])

  return {
    transactions: useAppSelector(selectVisibleTransactions),
    monthGroups: useAppSelector(selectVisibleMonthGroups),
    status: useAppSelector(selectListStatus),
    error: useAppSelector(selectListError),
    totalItems: useAppSelector(selectTotalItems),
    totalPages: useAppSelector(selectTotalPages),
  }
}
