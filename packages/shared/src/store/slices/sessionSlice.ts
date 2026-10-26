import { createSlice, isPending, isRejected } from '@reduxjs/toolkit'
import type { Credentials } from '@bytebank/application'
import type { AuthUser } from '@bytebank/domain'
import { createAppAsyncThunk, toErrorMessage } from '../createAppAsyncThunk'

export type SessionStatus =
  | 'unknown'
  | 'loading'
  | 'authenticated'
  | 'anonymous'

export type SessionState = {
  user: AuthUser | null
  status: SessionStatus
  error: string | null
}

const initialState: SessionState = {
  user: null,
  status: 'unknown',
  error: null,
}

export const restoreSession = createAppAsyncThunk<AuthUser | null, void>(
  'session/restore',
  (_arg, { extra }) => extra.session.getSession(),
  {
    // Em StrictMode os dois ciclos de efeito rodam antes do re-render, então o
    // guard do componente enxerga 'unknown' nas duas vezes. Aqui a leitura é do
    // estado corrente, e a segunda chamada não sai.
    condition: (_arg, { getState }) => getState().session.status !== 'loading',
  }
)

export const signIn = createAppAsyncThunk<AuthUser, Credentials>(
  'session/signIn',
  async (credentials, { extra, rejectWithValue }) => {
    try {
      return await extra.session.login(credentials)
    } catch (error) {
      return rejectWithValue(toErrorMessage(error, 'Falha ao entrar.'))
    }
  }
)

export const signUp = createAppAsyncThunk<AuthUser, Credentials>(
  'session/signUp',
  async (credentials, { extra, rejectWithValue }) => {
    try {
      return await extra.session.register(credentials)
    } catch (error) {
      return rejectWithValue(toErrorMessage(error, 'Falha ao criar conta.'))
    }
  }
)

export const signOut = createAppAsyncThunk<void, void>(
  'session/signOut',
  (_arg, { extra }) => extra.session.logout()
)

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = action.payload ? 'authenticated' : 'anonymous'
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
        state.error = null
      })
      .addCase(signOut.pending, (state) => {
        state.user = null
        state.status = 'anonymous'
        state.error = null
      })
      .addMatcher(isPending(restoreSession, signIn, signUp), (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addMatcher(isRejected(restoreSession, signIn, signUp), (state, action) => {
        state.user = null
        state.status = 'anonymous'
        state.error = action.payload ?? action.error.message ?? null
      })
  },
})

export const sessionReducer = sessionSlice.reducer
