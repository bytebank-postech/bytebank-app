import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AppThunkConfig } from './types'

export const createAppAsyncThunk = createAsyncThunk.withTypes<AppThunkConfig>()

export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
