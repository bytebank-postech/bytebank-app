'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleBalanceVisible } from '../store/slices/preferencesSlice'
import {
  selectBalanceVisible,
  selectPreferencesHydrated,
} from '../store/selectors/preferencesSelectors'

export function useBalanceVisibility() {
  const dispatch = useAppDispatch()
  const isHydrated = useAppSelector(selectPreferencesHydrated)
  const balanceVisible = useAppSelector(selectBalanceVisible)

  const handleToggle = useCallback(() => {
    dispatch(toggleBalanceVisible())
  }, [dispatch])

  return { isVisible: isHydrated && balanceVisible, handleToggle }
}
