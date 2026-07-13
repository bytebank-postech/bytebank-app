import { NextResponse } from 'next/server'
import { attachments, transactions } from '@/data/inmemory'

const acceptedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])
const maxFileSize = 5 * 1024 * 1024

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const transaction = transactions.find((item) => item.id === id)
  if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(transaction.attachments ?? [])
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const transaction = transactions.find((item) => item.id === id)
  if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const formData = await request.formData()
  const files = formData.getAll('files').filter((item): item is File => item instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
  }

  for (const file of files) {
    if (!acceptedTypes.has(file.type) || file.size > maxFileSize) {
      return NextResponse.json(
        { error: 'Envie arquivos PDF, PNG ou JPEG de até 5 MB.' },
        { status: 400 }
      )
    }
  }

  const created = await Promise.all(
    files.map(async (file) => {
      const attachmentId = crypto.randomUUID()
      const metadata = {
        id: attachmentId,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/api/transactions/${id}/attachments/${attachmentId}`,
      }
      attachments.set(attachmentId, {
        transactionId: id,
        name: file.name,
        mimeType: file.type,
        content: Buffer.from(await file.arrayBuffer()),
      })
      return metadata
    })
  )

  transaction.attachments = [...(transaction.attachments ?? []), ...created]
  return NextResponse.json(created, { status: 201 })
}
