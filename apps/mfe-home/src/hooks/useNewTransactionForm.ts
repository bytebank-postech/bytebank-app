'use client'

import { useCallback, useMemo, useReducer } from 'react'
import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from '@bytebank/domain'
import {
  amountForType,
  parseBRLAmount,
  suggestTransactionCategory,
} from '@bytebank/domain'

type NewTransactionFormState = {
  type: TransactionType | ''
  description: string
  category: TransactionCategory
  categoryTouched: boolean
  amount: string
  files: File[]
}

type NewTransactionFormAction =
  | { type: 'setType'; value: TransactionType }
  | { type: 'setDescription'; value: string }
  | { type: 'setCategory'; value: TransactionCategory }
  | { type: 'setAmount'; value: string }
  | { type: 'setFiles'; value: File[] }
  | { type: 'reset' }

export type TransactionDraft =
  | { ok: true; data: Omit<Transaction, 'id'>; files: File[] }
  | { ok: false; message: string }

const initialState: NewTransactionFormState = {
  type: '',
  description: '',
  category: 'Outros',
  categoryTouched: false,
  amount: '',
  files: [],
}

function formatBRLFromDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''

  return (Number(digits) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function todayISO(): string {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${today.getFullYear()}-${month}-${day}`
}

function formReducer(
  state: NewTransactionFormState,
  action: NewTransactionFormAction
): NewTransactionFormState {
  switch (action.type) {
    case 'setType':
      return { ...state, type: action.value }
    case 'setDescription':
      return {
        ...state,
        description: action.value,
        category: state.categoryTouched
          ? state.category
          : suggestTransactionCategory(action.value),
      }
    case 'setCategory':
      return { ...state, category: action.value, categoryTouched: true }
    case 'setAmount':
      return { ...state, amount: formatBRLFromDigits(action.value) }
    case 'setFiles':
      return { ...state, files: action.value }
    case 'reset':
      return initialState
    default:
      return state
  }
}

export function useNewTransactionForm() {
  const [values, dispatch] = useReducer(formReducer, initialState)

  const handleTypeChange = useCallback((value: TransactionType) => {
    dispatch({ type: 'setType', value })
  }, [])

  const handleDescriptionChange = useCallback((value: string) => {
    dispatch({ type: 'setDescription', value })
  }, [])

  const handleCategoryChange = useCallback((value: TransactionCategory) => {
    dispatch({ type: 'setCategory', value })
  }, [])

  const handleAmountChange = useCallback((value: string) => {
    dispatch({ type: 'setAmount', value })
  }, [])

  const handleFilesChange = useCallback((value: File[]) => {
    dispatch({ type: 'setFiles', value })
  }, [])

  const handleReset = useCallback(() => {
    dispatch({ type: 'reset' })
  }, [])

  const buildDraft = useCallback((): TransactionDraft => {
    if (!values.type) {
      return { ok: false, message: 'Selecione o tipo de transação.' }
    }

    const name = values.description.trim()
    if (!name) {
      return { ok: false, message: 'Informe uma descrição.' }
    }

    const parsed = parseBRLAmount(values.amount)
    if (parsed === null || parsed === 0) {
      return { ok: false, message: 'Informe um valor válido.' }
    }

    return {
      ok: true,
      files: values.files,
      data: {
        type: values.type,
        name,
        amount: amountForType(values.type, parsed),
        date: todayISO(),
        category: values.category,
      },
    }
  }, [values])

  return useMemo(
    () => ({
      values,
      buildDraft,
      handleTypeChange,
      handleDescriptionChange,
      handleCategoryChange,
      handleAmountChange,
      handleFilesChange,
      handleReset,
    }),
    [
      values,
      buildDraft,
      handleTypeChange,
      handleDescriptionChange,
      handleCategoryChange,
      handleAmountChange,
      handleFilesChange,
      handleReset,
    ]
  )
}
