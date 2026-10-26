import { describe, expect, it } from 'vitest'
import { getClassnames } from './getClassnames'

describe('getClassnames', () => {
  it('junta as classes informadas', () => {
    expect(getClassnames('card', 'card--active')).toBe('card card--active')
  })

  it('descarta valores ausentes e condicionais falsos', () => {
    expect(getClassnames('card', undefined, null, false, 'is-open')).toBe(
      'card is-open'
    )
  })

  it('devolve string vazia quando nada é aplicável', () => {
    expect(getClassnames(undefined, false)).toBe('')
  })
})
