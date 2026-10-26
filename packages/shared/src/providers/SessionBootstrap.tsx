'use client'

import { useEffect, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { restoreSession } from '../store/slices/sessionSlice'
import { selectSessionStatus } from '../store/selectors/sessionSelectors'

export function SessionBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectSessionStatus)

  useEffect(() => {
    if (status !== 'unknown') return

    dispatch(restoreSession())
  }, [dispatch, status])

  return <>{children}</>
}
