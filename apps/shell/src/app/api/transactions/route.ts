import { NextResponse } from 'next/server'
import type { TransactionType } from '@bytebank/domain'
import { createServerTransactionUseCases } from '@bytebank/infrastructure/server'
import { withAuthenticatedUser } from '@/server/authentication'
import { toErrorResponse } from '@/server/errorResponse'
import {
  parseCreateTransactionInput,
  readJsonBody,
} from '@/server/parseTransactionInput'

type Params = { params: Promise<Record<string, never>> }

export const GET = withAuthenticatedUser<Params>(async (request, _context, user) => {
  const useCases = createServerTransactionUseCases(user.id)
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
})

export const POST = withAuthenticatedUser<Params>(async (request, _context, user) => {
  try {
    const input = parseCreateTransactionInput(await readJsonBody(request))
    const useCases = createServerTransactionUseCases(user.id)
    const created = await useCases.createTransaction.execute(input)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
})
