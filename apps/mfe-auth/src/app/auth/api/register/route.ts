import { EmailAlreadyInUseError, ValidationError } from '@bytebank/application'
import { createAuthUseCases } from '@bytebank/infrastructure/server'
import { NextResponse } from 'next/server'

const authUseCases = createAuthUseCases()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    const { user, token } = await authUseCases.registerUser.execute(
      email ?? '',
      password ?? ''
    )

    const response = NextResponse.json({
      token,
      user,
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    })

    return response
  } catch (error) {
    if (error instanceof EmailAlreadyInUseError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Não foi possível concluir a autenticação.' },
      { status: 400 }
    )
  }
}
