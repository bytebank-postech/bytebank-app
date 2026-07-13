import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@bytebank/shared'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  const user = await verifyAuthToken(token)
  if (!user) {
    const response = NextResponse.redirect(new URL('/auth', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!auth(?:/|$)|api/health$|_next/|favicon.ico|.*-assets/).*)'],
}
