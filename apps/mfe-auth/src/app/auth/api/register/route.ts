import { EmailAlreadyInUseError, ValidationError } from '@bytebank/application'
import { createAuthUseCases } from '@bytebank/infrastructure/server'
import { NextResponse } from 'next/server'
import {
  createSessionResponse,
  readCredentials,
  toLogMessage,
} from '@/server/sessionResponse'

const authUseCases = createAuthUseCases()

export async function POST(request: Request) {
  try {
    const { email, password } = await readCredentials(request)

    const { user, token } = await authUseCases.registerUser.execute(
      email,
      password
    )

    return createSessionResponse(user, token)
  } catch (error) {
    if (error instanceof EmailAlreadyInUseError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[auth] Falha inesperada no cadastro:', toLogMessage(error))
    return NextResponse.json(
      { error: 'Não foi possível concluir a autenticação.' },
      { status: 400 }
    )
  }
}
