import { describe, expect, it } from 'vitest'
import { toError } from './toError'

describe('toError', () => {
  it('preserva o erro original', () => {
    const original = new Error('API fora do ar')

    expect(toError(original, 'fallback')).toBe(original)
  })

  it('converte a mensagem recusada pelo rejectWithValue', () => {
    expect(toError('Saldo insuficiente', 'fallback')).toEqual(
      new Error('Saldo insuficiente')
    )
  })

  it('usa o fallback quando não há mensagem aproveitável', () => {
    expect(toError(undefined, 'fallback').message).toBe('fallback')
    expect(toError('', 'fallback').message).toBe('fallback')
  })
})
