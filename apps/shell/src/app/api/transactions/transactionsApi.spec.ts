import { beforeEach, describe, expect, it } from 'vitest'
import type { Transaction } from '@bytebank/domain'
import {
  createRequest,
  createSessionToken,
  createTestUser,
  routeParams,
} from '@/testing/requests'
import * as collectionRoute from './route'
import * as itemRoute from './[id]/route'
import * as attachmentsRoute from './[id]/attachments/route'
import * as attachmentRoute from './[id]/attachments/[attachmentId]/route'

const draft = {
  type: 'Pix',
  name: 'Freela',
  amount: 900,
  date: '2026-03-12',
  category: 'Salário',
}

const noParams = routeParams({})

const createTransactionAs = async (token: string): Promise<Transaction> => {
  const response = await collectionRoute.POST(
    createRequest('/api/transactions', { method: 'POST', token, body: draft }),
    noParams
  )
  expect(response.status).toBe(201)
  return response.json()
}

const uploadAttachmentAs = async (token: string, transactionId: string) => {
  const formData = new FormData()
  formData.append(
    'files',
    new File(['%PDF-1.4'], 'nota "fiscal".pdf', { type: 'application/pdf' })
  )
  const response = await attachmentsRoute.POST(
    createRequest(`/api/transactions/${transactionId}/attachments`, {
      method: 'POST',
      token,
      body: formData,
    }),
    routeParams({ id: transactionId })
  )
  expect(response.status).toBe(201)
  const [attachment] = await response.json()
  return attachment as { id: string }
}

describe('API de transações — autenticação e isolamento', () => {
  let aliceToken: string
  let bobToken: string

  beforeEach(async () => {
    aliceToken = await createSessionToken(createTestUser())
    bobToken = await createSessionToken(createTestUser())
  })

  it('rejeita todas as rotas sem sessão válida, mesmo sem passar pelo proxy', async () => {
    const id = routeParams({ id: '1' })
    const attachment = routeParams({ id: '1', attachmentId: 'a' })
    const responses = await Promise.all([
      collectionRoute.GET(createRequest('/api/transactions'), noParams),
      collectionRoute.POST(
        createRequest('/api/transactions', { method: 'POST', body: draft }),
        noParams
      ),
      itemRoute.GET(createRequest('/api/transactions/1'), id),
      itemRoute.PUT(
        createRequest('/api/transactions/1', { method: 'PUT', body: draft }),
        id
      ),
      itemRoute.DELETE(
        createRequest('/api/transactions/1', { method: 'DELETE', token: 'x' }),
        id
      ),
      attachmentsRoute.GET(createRequest('/api/transactions/1/attachments'), id),
      attachmentRoute.GET(
        createRequest('/api/transactions/1/attachments/a'),
        attachment
      ),
      attachmentRoute.DELETE(
        createRequest('/api/transactions/1/attachments/a', { method: 'DELETE' }),
        attachment
      ),
    ])

    expect(responses.map((response) => response.status)).toEqual(
      Array(responses.length).fill(401)
    )
  })

  it('cada usuário vê somente as próprias transações', async () => {
    const created = await createTransactionAs(aliceToken)

    const aliceList = await collectionRoute.GET(
      createRequest('/api/transactions', { token: aliceToken }),
      noParams
    )
    const bobPage = await collectionRoute.GET(
      createRequest('/api/transactions?page=1&pageSize=10', { token: bobToken }),
      noParams
    )

    await expect(aliceList.json()).resolves.toEqual([created])
    await expect(bobPage.json()).resolves.toMatchObject({ items: [], total: 0 })
  })

  it('impede leitura, edição e exclusão da transação de outro usuário', async () => {
    const created = await createTransactionAs(aliceToken)
    const id = routeParams({ id: created.id })

    const read = await itemRoute.GET(
      createRequest(`/api/transactions/${created.id}`, { token: bobToken }),
      id
    )
    const update = await itemRoute.PUT(
      createRequest(`/api/transactions/${created.id}`, {
        method: 'PUT',
        token: bobToken,
        body: { amount: 1 },
      }),
      id
    )
    await itemRoute.DELETE(
      createRequest(`/api/transactions/${created.id}`, {
        method: 'DELETE',
        token: bobToken,
      }),
      id
    )
    const stillThere = await itemRoute.GET(
      createRequest(`/api/transactions/${created.id}`, { token: aliceToken }),
      id
    )

    expect(read.status).toBe(404)
    expect(update.status).toBe(404)
    await expect(stillThere.json()).resolves.toEqual(created)
  })

  it('ignora campos não permitidos e valida a entrada', async () => {
    const forged = await collectionRoute.POST(
      createRequest('/api/transactions', {
        method: 'POST',
        token: aliceToken,
        body: {
          ...draft,
          id: 'forjado',
          attachments: [{ id: 'x', url: 'https://malicioso.example' }],
        },
      }),
      noParams
    )
    const invalid = await collectionRoute.POST(
      createRequest('/api/transactions', {
        method: 'POST',
        token: aliceToken,
        body: { ...draft, amount: 'muito' },
      }),
      noParams
    )

    const created = await forged.json()
    expect(created.id).not.toBe('forjado')
    expect(created.attachments).toEqual([])
    expect(invalid.status).toBe(400)
  })

  it('protege anexos e responde com cabeçalhos seguros ao dono', async () => {
    const created = await createTransactionAs(aliceToken)
    const attachment = await uploadAttachmentAs(aliceToken, created.id)
    const params = routeParams({ id: created.id, attachmentId: attachment.id })
    const path = `/api/transactions/${created.id}/attachments/${attachment.id}`

    const asBob = await attachmentRoute.GET(
      createRequest(path, { token: bobToken }),
      params
    )
    const asAlice = await attachmentRoute.GET(
      createRequest(path, { token: aliceToken }),
      params
    )

    expect(asBob.status).toBe(404)
    expect(asAlice.status).toBe(200)
    expect(asAlice.headers.get('x-content-type-options')).toBe('nosniff')
    expect(asAlice.headers.get('content-disposition')).toBe(
      `inline; filename="nota _fiscal_.pdf"; filename*=UTF-8''nota%20%22fiscal%22.pdf`
    )
  })
})
