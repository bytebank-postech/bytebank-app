import { NextResponse } from 'next/server'
import { attachments, transactions } from '@/data/inmemory'

type Params = { params: Promise<{ id: string; attachmentId: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id, attachmentId } = await params
  const attachment = attachments.get(attachmentId)
  if (!attachment || attachment.transactionId !== id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(attachment.content), {
    headers: {
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `inline; filename="${attachment.name}"`,
    },
  })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id, attachmentId } = await params
  const transaction = transactions.find((item) => item.id === id)
  const attachment = attachments.get(attachmentId)
  if (!transaction || !attachment || attachment.transactionId !== id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  attachments.delete(attachmentId)
  transaction.attachments = (transaction.attachments ?? []).filter(
    (item) => item.id !== attachmentId
  )
  return new NextResponse(null, { status: 204 })
}
