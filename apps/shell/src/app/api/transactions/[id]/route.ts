import { NextResponse } from 'next/server'
import { NotFoundError } from '@bytebank/application'
import { createServerTransactionUseCases } from '@bytebank/infrastructure/server'

const useCases = createServerTransactionUseCases()

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  try {
    const transaction = await useCases.getTransactionById.execute(id)
    return NextResponse.json(transaction)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    throw error
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()

  try {
    const updated = await useCases.updateTransaction.execute(id, body)
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    throw error
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  await useCases.deleteTransaction.execute(id)
  return NextResponse.json({ message: 'Deleted' })
}
