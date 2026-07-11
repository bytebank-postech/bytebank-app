import { findUserByEmailAndPassword } from '@/data/users'
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

    return NextResponse.json({
      user: {
        id: '1',
        name: user.name,
        email: user.email,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }
}
