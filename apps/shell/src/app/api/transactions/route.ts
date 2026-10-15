import { NextResponse } from 'next/server'
import type { TransactionType } from '@bytebank/domain'
import { createServerTransactionUseCases } from '@bytebank/infrastructure/server'

const useCases = createServerTransactionUseCases()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageParam = searchParams.get('page')
  if (!pageParam) {
    const items = await useCases.listTransactions.execute()
    return NextResponse.json(items)
  }

  const type = searchParams.get('type') as TransactionType | null

  const page = await useCases.getTransactionPage.execute({
    page: Math.max(1, Number(pageParam) || 1),
    pageSize: Math.min(
      50,
      Math.max(1, Number(searchParams.get('pageSize')) || 10)
    ),
    search: searchParams.get('search') ?? undefined,
    type: type ?? undefined,
    month: searchParams.get('month') ?? undefined,
  })

  return NextResponse.json(page)
}

export async function POST(request: Request) {
  const body = await request.json()
  const created = await useCases.createTransaction.execute(body)
  return NextResponse.json(created, { status: 201 })
}
