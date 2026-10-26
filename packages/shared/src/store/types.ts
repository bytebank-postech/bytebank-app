import type { Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import type {
  AttachmentUpload,
  SessionGateway,
  TransactionUseCases,
} from '@bytebank/application'
import type { RootState } from './rootReducer'

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

export type AppExtra = {
  transactions: TransactionUseCases
  session: SessionGateway
  toAttachmentUploads: (files: File[]) => Promise<AttachmentUpload[]>
}

export type AppDispatch = ThunkDispatch<RootState, AppExtra, UnknownAction> &
  Dispatch<UnknownAction>

export type AppThunkConfig = {
  state: RootState
  dispatch: AppDispatch
  extra: AppExtra
  rejectValue: string
}
