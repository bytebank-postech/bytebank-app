import { NextResponse } from 'next/server'
import transactionsData from '@/data/transactions.json'
import { Transaction } from '@/types/transaction'

let data: Transaction[] = transactionsData as Transaction[]

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const transaction = data.find((t) => t.id === id)
  if (!transaction) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(transaction)
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()
  data = data.map((t) => (t.id === id ? { ...t, ...body } : t))
  const updated = data.find((t) => t.id === id)
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  data = data.filter((t) => t.id !== id)
  return NextResponse.json({ message: 'Deleted' })
}
