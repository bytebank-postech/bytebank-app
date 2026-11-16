import { NextResponse, type NextRequest } from 'next/server'
import type { AuthUser } from '@bytebank/domain'
import {
  AUTH_COOKIE_NAME,
  createTokenService,
} from '@bytebank/infrastructure/server'

const tokenService = createTokenService()

export const getAuthenticatedUser = async (
  request: NextRequest
): Promise<AuthUser | null> => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  return tokenService.verify(token)
}

export const createUnauthorizedResponse = () => {
  const response = NextResponse.json(
    { error: 'Sessão inválida ou expirada.' },
    { status: 401 }
  )
  response.cookies.delete(AUTH_COOKIE_NAME)
  return response
}

type AuthenticatedHandler<Context> = (
  request: NextRequest,
  context: Context,
  user: AuthUser
) => Promise<Response>

export const withAuthenticatedUser =
  <Context>(handler: AuthenticatedHandler<Context>) =>
  async (request: NextRequest, context: Context): Promise<Response> => {
    const user = await getAuthenticatedUser(request)
    if (!user) return createUnauthorizedResponse()
    return handler(request, context, user)
  }
