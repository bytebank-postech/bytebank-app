import { NextResponse } from 'next/server'
import { NotFoundError, ValidationError } from '@bytebank/application'
import { createServerTransactionUseCases } from '@bytebank/infrastructure/server'

const useCases = createServerTransactionUseCases()

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  try {
    const attachments = await useCases.listTransactionAttachments.execute(id)
    return NextResponse.json(attachments)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    throw error
  }
}

export async function POST(request: Request, { params }: Params) {
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
    const created = await useCases.addTransactionAttachments.execute(
      id,
      uploads
    )
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    throw error
  }
}
