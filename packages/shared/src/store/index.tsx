'use client'

import { configureStore } from '@reduxjs/toolkit'
import { Provider, useDispatch, useSelector } from 'react-redux'
import type { PropsWithChildren } from 'react'
import transactionsReducer from './transactionsSlice'

export const store = configureStore({
  reducer: { transactions: transactionsReducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export function StoreProvider({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>
}

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export * from './transactionsSlice'
