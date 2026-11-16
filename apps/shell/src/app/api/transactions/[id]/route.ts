import { NextResponse } from 'next/server'
import { createServerTransactionUseCases } from '@bytebank/infrastructure/server'
import { withAuthenticatedUser } from '@/server/authentication'
import { toErrorResponse } from '@/server/errorResponse'
import {
  parseUpdateTransactionInput,
  readJsonBody,
} from '@/server/parseTransactionInput'

type Params = { params: Promise<{ id: string }> }

export const GET = withAuthenticatedUser<Params>(async (_request, { params }, user) => {
  const { id } = await params
  try {
    const useCases = createServerTransactionUseCases(user.id)
    const transaction = await useCases.getTransactionById.execute(id)
    return NextResponse.json(transaction)
  } catch (error) {
    return toErrorResponse(error)
  }
})

export const PUT = withAuthenticatedUser<Params>(async (request, { params }, user) => {
  const { id } = await params
  try {
    const input = parseUpdateTransactionInput(await readJsonBody(request))
    const useCases = createServerTransactionUseCases(user.id)
    const updated = await useCases.updateTransaction.execute(id, input)
    return NextResponse.json(updated)
  } catch (error) {
    return toErrorResponse(error)
  }
})

export const DELETE = withAuthenticatedUser<Params>(async (_request, { params }, user) => {
  const { id } = await params
  const useCases = createServerTransactionUseCases(user.id)
  await useCases.deleteTransaction.execute(id)
  return NextResponse.json({ message: 'Deleted' })
})
