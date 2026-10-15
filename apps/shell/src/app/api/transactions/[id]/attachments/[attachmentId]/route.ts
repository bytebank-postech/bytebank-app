import { NextResponse } from 'next/server'
import { NotFoundError } from '@bytebank/application'
import { createServerTransactionUseCases } from '@bytebank/infrastructure/server'

const useCases = createServerTransactionUseCases()

type Params = { params: Promise<{ id: string; attachmentId: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id, attachmentId } = await params
  try {
    const attachment = await useCases.getAttachmentContent.execute(
      id,
      attachmentId
    )
    return new NextResponse(Buffer.from(attachment.content), {
      headers: {
        'Content-Type': attachment.mimeType,
        'Content-Disposition': `inline; filename="${attachment.name}"`,
      },
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    throw error
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id, attachmentId } = await params
  try {
    await useCases.removeTransactionAttachment.execute(id, attachmentId)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    throw error
  }
}
