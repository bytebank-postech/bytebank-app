import { NextResponse } from 'next/server'
import { transactions } from '@/data/inmemory'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const transaction = transactions.find((t) => t.id === id)
  if (!transaction) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(transaction)
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()

  const index = transactions.findIndex((t) => t.id === id)

  if (index !== -1) {
    transactions[index] = body
  } else {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const updated = transactions.find((t) => t.id === id)
  console.debug(`content: ${updated}`)
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const index = transactions.findIndex((t) => t.id === id)

  if (index !== -1) {
    transactions.splice(index, 1)
  }

  return NextResponse.json({ message: 'Deleted' })
}
