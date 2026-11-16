import { describe, expect, it } from 'vitest'
import type { AttachmentUpload } from '@bytebank/application'
import { DEMO_USER_ID } from '../seed'
import { InMemoryTransactionRepository } from './InMemoryTransactionRepository'

const draft = {
  type: 'Pix' as const,
  name: 'Freela',
  amount: 900,
  date: '2026-03-12',
}

const pdf: AttachmentUpload = {
  name: 'comprovante.pdf',
  mimeType: 'application/pdf',
  size: 4,
  content: new TextEncoder().encode('%PDF').buffer as ArrayBuffer,
}

const createOwners = () => {
  const bobId = `bob-${crypto.randomUUID()}`
  return {
    alice: new InMemoryTransactionRepository(`alice-${crypto.randomUUID()}`),
    bob: new InMemoryTransactionRepository(bobId),
    bobId,
  }
}

describe('InMemoryTransactionRepository — isolamento entre usuários', () => {
  it('novos usuários começam sem transações e os dados de exemplo pertencem à conta demo', async () => {
    const { alice } = createOwners()
    const demo = new InMemoryTransactionRepository(DEMO_USER_ID)

    await expect(alice.list()).resolves.toEqual([])
    expect((await demo.list()).length).toBeGreaterThan(0)
  })

  it('lista e pagina somente as transações do dono', async () => {
    const { alice, bob } = createOwners()
    const created = await alice.create(draft)

    expect(await alice.list()).toEqual([created])
    await expect(bob.list()).resolves.toEqual([])
    expect((await bob.getPage({ page: 1, pageSize: 10 })).total).toBe(0)
  })

  it('não expõe o identificador do dono nas respostas', async () => {
    const { alice } = createOwners()
    const created = await alice.create(draft)

    expect(created).not.toHaveProperty('ownerId')
    expect(await alice.getById(created.id)).not.toHaveProperty('ownerId')
  })

  it('impede que outro usuário leia, altere ou exclua a transação', async () => {
    const { alice, bob } = createOwners()
    const created = await alice.create(draft)

    await expect(bob.getById(created.id)).resolves.toBeNull()
    await expect(bob.update(created.id, { amount: 1 })).resolves.toBeNull()
    await bob.delete(created.id)

    await expect(alice.getById(created.id)).resolves.toEqual(created)
  })

  it('impede a transferência de posse via update', async () => {
    const { alice, bob, bobId } = createOwners()
    const created = await alice.create(draft)

    await alice.update(created.id, {
      name: 'Atualizado',
      ownerId: bobId,
    } as never)

    await expect(bob.getById(created.id)).resolves.toBeNull()
    expect((await alice.getById(created.id))?.name).toBe('Atualizado')
  })

  it('protege anexos contra acesso de outro usuário', async () => {
    const { alice, bob } = createOwners()
    const created = await alice.create(draft)
    const [attachment] = (await alice.addAttachments(created.id, [pdf])) ?? []

    await expect(bob.listAttachments(created.id)).resolves.toBeNull()
    await expect(bob.addAttachments(created.id, [pdf])).resolves.toBeNull()
    await expect(
      bob.getAttachmentContent(created.id, attachment.id)
    ).resolves.toBeNull()
    await expect(
      bob.removeAttachment(created.id, attachment.id)
    ).resolves.toBe(false)
    await expect(
      alice.getAttachmentContent(created.id, attachment.id)
    ).resolves.toMatchObject({ name: 'comprovante.pdf' })
  })

  it('apaga o conteúdo dos anexos junto com a transação', async () => {
    const { alice } = createOwners()
    const created = await alice.create(draft)
    const [attachment] = (await alice.addAttachments(created.id, [pdf])) ?? []

    await alice.delete(created.id)

    await expect(
      alice.getAttachmentContent(created.id, attachment.id)
    ).resolves.toBeNull()
  })
})
