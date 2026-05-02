import { NextResponse } from 'next/server'
import { Transaction } from '@/types/transaction'

import { transactions } from '@/data/inmemory'

export async function GET() {
  return NextResponse.json(transactions)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newTransaction: Transaction = {
    ...body,
    id: crypto.randomUUID(),
  }
  transactions.push(newTransaction)
  return NextResponse.json(newTransaction, { status: 201 })
}
