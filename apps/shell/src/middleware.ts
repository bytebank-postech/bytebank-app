import { NextRequest, NextResponse } from 'next/server'
import { ROUTES } from '@bytebank/shared'
import { jwtVerify } from 'jose/jwt/verify'

export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)

    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  const publicRoutes = Object.values(ROUTES.public)
  const isProtectedRoute = !publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (isProtectedRoute && token) {
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!auth).*)'],
}
