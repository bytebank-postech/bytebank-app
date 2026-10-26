'use client'

import { useCallback, useMemo } from 'react'
import type { TransactionType } from '@bytebank/domain'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  clearFilters,
  setMonth,
  setPage,
  setSearch,
  setType,
} from '../store/slices/transactionsSlice'
import {
  selectCurrentPage,
  selectHasActiveFilters,
  selectMonthFilter,
  selectPageSize,
  selectSearchTerm,
  selectTypeFilter,
} from '../store/selectors/transactionsSelectors'

export function useTransactionFilters() {
  const dispatch = useAppDispatch()

  const search = useAppSelector(selectSearchTerm)
  const type = useAppSelector(selectTypeFilter)
  const month = useAppSelector(selectMonthFilter)
  const page = useAppSelector(selectCurrentPage)
  const pageSize = useAppSelector(selectPageSize)
  const hasActiveFilters = useAppSelector(selectHasActiveFilters)

  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(setSearch(value))
    },
    [dispatch]
  )

  const handleTypeChange = useCallback(
    (value: TransactionType | 'Todos') => {
      dispatch(setType(value))
    },
    [dispatch]
  )

  const handleMonthChange = useCallback(
    (value: string | 'Todos') => {
      dispatch(setMonth(value))
    },
    [dispatch]
  )

  const handlePageChange = useCallback(
    (value: number) => {
      dispatch(setPage(value))
    },
    [dispatch]
  )

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters())
  }, [dispatch])

  return useMemo(
    () => ({
      search,
      type,
      month,
      page,
      pageSize,
      hasActiveFilters,
      handleSearchChange,
      handleTypeChange,
      handleMonthChange,
      handlePageChange,
      handleClearFilters,
    }),
    [
      search,
      type,
      month,
      page,
      pageSize,
      hasActiveFilters,
      handleSearchChange,
      handleTypeChange,
      handleMonthChange,
      handlePageChange,
      handleClearFilters,
    ]
  )
}
