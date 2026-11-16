import { NextResponse } from 'next/server'
import { createServerTransactionUseCases } from '@bytebank/infrastructure/server'
import { withAuthenticatedUser } from '@/server/authentication'
import { toErrorResponse } from '@/server/errorResponse'

type Params = { params: Promise<{ id: string }> }

export const GET = withAuthenticatedUser<Params>(async (_request, { params }, user) => {
  const { id } = await params
  try {
    const useCases = createServerTransactionUseCases(user.id)
    const attachments = await useCases.listTransactionAttachments.execute(id)
    return NextResponse.json(attachments)
  } catch (error) {
    return toErrorResponse(error)
  }
})

export const POST = withAuthenticatedUser<Params>(async (request, { params }, user) => {
  const { id } = await params
  const formData = await request.formData()
  const files = formData
    .getAll('files')
    .filter((item): item is File => item instanceof File)

  try {
    const uploads = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        mimeType: file.type,
        size: file.size,
        content: await file.arrayBuffer(),
      }))
    )
    const useCases = createServerTransactionUseCases(user.id)
    const created = await useCases.addTransactionAttachments.execute(
      id,
      uploads
    )
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
})
