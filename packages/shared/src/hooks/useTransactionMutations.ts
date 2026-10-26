'use client'

import { useCallback, useMemo } from 'react'
import type { Transaction } from '@bytebank/domain'
import { toError } from '../utils/toError'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  createTransaction,
  deleteTransactions,
  removeTransactionAttachment,
  updateTransaction,
} from '../store/slices/transactionsSlice'
import {
  selectIsMutating,
  selectMutationError,
} from '../store/selectors/transactionsSelectors'

function rejectAsError<T>(result: Promise<T>, fallback: string): Promise<T> {
  return result.catch((reason) => {
    throw toError(reason, fallback)
  })
}

export function useTransactionMutations() {
  const dispatch = useAppDispatch()

  const isMutating = useAppSelector(selectIsMutating)
  const error = useAppSelector(selectMutationError)

  const create = useCallback(
    (data: Omit<Transaction, 'id'>, files: File[] = []) =>
      rejectAsError(
        dispatch(createTransaction({ data, files })).unwrap(),
        'Não foi possível criar a transação.'
      ),
    [dispatch]
  )

  const update = useCallback(
    (id: string, data: Partial<Transaction>, files: File[] = []) =>
      rejectAsError(
        dispatch(updateTransaction({ id, data, files })).unwrap(),
        'Não foi possível atualizar a transação.'
      ),
    [dispatch]
  )

  const remove = useCallback(
    async (ids: string[]) => {
      const action = await dispatch(deleteTransactions(ids))

      return deleteTransactions.fulfilled.match(action)
    },
    [dispatch]
  )

  const removeAttachment = useCallback(
    (transactionId: string, attachmentId: string) =>
      rejectAsError(
        dispatch(
          removeTransactionAttachment({ transactionId, attachmentId })
        ).unwrap(),
        'Não foi possível remover o anexo.'
      ),
    [dispatch]
  )

  return useMemo(
    () => ({ isMutating, error, create, update, remove, removeAttachment }),
    [isMutating, error, create, update, remove, removeAttachment]
  )
}
