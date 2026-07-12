import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { ROUTES, JWT_CONFIG } from '@bytebank/shared'

export function verifyToken(token: string) {
  try {
    // TODO ajustar
    // const decoded = jwt.verify(token, JWT_CONFIG.secret)
    return true
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  const publicRoutes = Object.values(ROUTES.public)
  const isProtectedRoute = !publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (isProtectedRoute && token) {
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!auth).*)'],
}
