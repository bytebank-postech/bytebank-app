import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './passwordHasher'

describe('passwordHasher', () => {
  it('nunca devolve a senha em texto puro e usa salt aleatório', async () => {
    const first = await hashPassword('senha-forte')
    const second = await hashPassword('senha-forte')

    expect(first).not.toContain('senha-forte')
    expect(first).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/)
    expect(first).not.toBe(second)
  })

  it('confirma a senha correta e rejeita a incorreta', async () => {
    const stored = await hashPassword('senha-forte')

    await expect(verifyPassword('senha-forte', stored)).resolves.toBe(true)
    await expect(verifyPassword('senha-errada', stored)).resolves.toBe(false)
  })

  it('rejeita hashes malformados sem lançar erro', async () => {
    await expect(verifyPassword('qualquer', 'sem-separador')).resolves.toBe(false)
    await expect(verifyPassword('qualquer', 'abc:00')).resolves.toBe(false)
  })
})
