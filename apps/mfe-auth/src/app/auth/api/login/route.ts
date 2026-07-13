import { findUserByEmailAndPassword } from '@/data/users'
import { signAuthToken } from '@bytebank/shared'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    const user = findUserByEmailAndPassword(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
    }

    const token = await signAuthToken(userData)

    const response = NextResponse.json({
      token,
      user: userData,
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 horas
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }
}
