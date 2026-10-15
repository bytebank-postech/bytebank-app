import { createAuthUseCases } from '@bytebank/infrastructure/server'
import { NextRequest, NextResponse } from 'next/server'

const authUseCases = createAuthUseCases()

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const user = await authUseCases.getSession.execute(token)
  if (!user) return NextResponse.json({ user: null }, { status: 401 })

  return NextResponse.json({ user })
}
