import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@bytebank/infrastructure/server'
import {
  createUnauthorizedResponse,
  getAuthenticatedUser,
} from './server/authentication'

const isApiRequest = (request: NextRequest) =>
  request.nextUrl.pathname.startsWith('/api/')

export async function proxy(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (user) return NextResponse.next()

  if (isApiRequest(request)) return createUnauthorizedResponse()

  const response = NextResponse.redirect(new URL('/auth', request.url))
  response.cookies.delete(AUTH_COOKIE_NAME)
  return response
}

export const config = {
  matcher: ['/((?!auth(?:/|$)|api/health$|_next/|favicon.ico|.*-assets/).*)'],
}
