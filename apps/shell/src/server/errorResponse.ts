import { NextResponse } from 'next/server'
import { NotFoundError, ValidationError } from '@bytebank/application'

export const toErrorResponse = (error: unknown) => {
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  throw error
}
