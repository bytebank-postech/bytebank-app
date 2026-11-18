import { NextRequest } from 'next/server'
import type { AuthUser } from '@bytebank/domain'
import {
  AUTH_COOKIE_NAME,
  createTokenService,
} from '@bytebank/infrastructure/server'

const BASE_URL = 'http://localhost:3000'

export const createTestUser = (): AuthUser => {
  const id = crypto.randomUUID()
  return { id, name: `Pessoa ${id}`, email: `${id}@bytebank.dev` }
}

export const createSessionToken = (user: AuthUser) =>
  createTokenService().sign(user)

type RequestOptions = {
  method?: string
  token?: string
  body?: unknown
}

export const createRequest = (
  path: string,
  { method = 'GET', token, body }: RequestOptions = {}
) => {
  const headers = new Headers()
  if (token) headers.set('cookie', `${AUTH_COOKIE_NAME}=${token}`)

  const isFormData = body instanceof FormData
  if (body !== undefined && !isFormData) {
    headers.set('content-type', 'application/json')
  }

  return new NextRequest(new URL(path, BASE_URL), {
    method,
    headers,
    body: isFormData || body === undefined ? body : JSON.stringify(body),
  })
}

export const routeParams = <Params extends Record<string, string>>(
  params: Params
) => ({ params: Promise.resolve(params) })
