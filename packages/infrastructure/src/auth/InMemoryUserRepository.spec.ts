import { describe, expect, it } from 'vitest'
import { InMemoryUserRepository } from './InMemoryUserRepository'

const uniqueEmail = () => `user-${crypto.randomUUID()}@bytebank.dev`

describe('InMemoryUserRepository', () => {
  it('autentica o usuário de demonstração com a senha documentada', async () => {
    const repository = new InMemoryUserRepository()

    const user = await repository.findByEmailAndPassword(
      'usuario@bytebank.com',
      'senha123'
    )

    expect(user).toEqual({
      id: '1',
      name: 'Usuário ByteBank',
      email: 'usuario@bytebank.com',
    })
  })

  it('cria usuários sem expor a senha e permite login com ela', async () => {
    const repository = new InMemoryUserRepository()
    const email = uniqueEmail()

    const created = await repository.create({
      email,
      password: 'senha-nova',
      name: 'Nova Pessoa',
    })

    expect(created).not.toHaveProperty('password')
    expect(created).not.toHaveProperty('passwordHash')
    await expect(
      repository.findByEmailAndPassword(email.toUpperCase(), 'senha-nova')
    ).resolves.toEqual(created)
  })

  it('rejeita senha incorreta e e-mail inexistente', async () => {
    const repository = new InMemoryUserRepository()

    await expect(
      repository.findByEmailAndPassword('usuario@bytebank.com', 'errada')
    ).resolves.toBeNull()
    await expect(
      repository.findByEmailAndPassword(uniqueEmail(), 'senha123')
    ).resolves.toBeNull()
  })
})
