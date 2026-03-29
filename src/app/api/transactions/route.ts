import { NextResponse } from 'next/server'
import transactionsData from '@/data/transactions.json'
import { Transaction } from '@/types/transaction'

let data: Transaction[] = transactionsData as Transaction[]

export async function GET() {
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newTransaction: Transaction = {
    ...body,
    id: crypto.randomUUID(),
  }
  data = [newTransaction, ...data]
  return NextResponse.json(newTransaction, { status: 201 })
}
