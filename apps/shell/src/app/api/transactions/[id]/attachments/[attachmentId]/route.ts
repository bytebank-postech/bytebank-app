import { NextResponse } from 'next/server'
import { createServerTransactionUseCases } from '@bytebank/infrastructure/server'
import { withAuthenticatedUser } from '@/server/authentication'
import { toErrorResponse } from '@/server/errorResponse'

type Params = { params: Promise<{ id: string; attachmentId: string }> }

const toContentDisposition = (fileName: string) => {
  const asciiFallback = fileName.replace(/[^\w.\- ]/g, '_')
  return `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
}

export const GET = withAuthenticatedUser<Params>(async (_request, { params }, user) => {
  const { id, attachmentId } = await params
  try {
    const useCases = createServerTransactionUseCases(user.id)
    const attachment = await useCases.getAttachmentContent.execute(
      id,
      attachmentId
    )
    return new NextResponse(Buffer.from(attachment.content), {
      headers: {
        'Content-Type': attachment.mimeType,
        'Content-Disposition': toContentDisposition(attachment.name),
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    return toErrorResponse(error)
  }
})

export const DELETE = withAuthenticatedUser<Params>(async (_request, { params }, user) => {
  const { id, attachmentId } = await params
  try {
    const useCases = createServerTransactionUseCases(user.id)
    await useCases.removeTransactionAttachment.execute(id, attachmentId)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return toErrorResponse(error)
  }
})
