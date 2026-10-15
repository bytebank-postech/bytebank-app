import { describe, expect, it } from 'vitest'
import { amountForType, parseBRLAmount } from './amount'

describe('parseBRLAmount', () => {
  it('parses Brazilian currency strings', () => {
    expect(parseBRLAmount('1.234,56')).toBe(1234.56)
    expect(parseBRLAmount('10,00')).toBe(10)
  })

  it('returns null for invalid input', () => {
    expect(parseBRLAmount('')).toBeNull()
    expect(parseBRLAmount('abc')).toBeNull()
  })
})

describe('amountForType', () => {
  it('keeps deposits and pix positive', () => {
    expect(amountForType('Depósito', 100)).toBe(100)
    expect(amountForType('Pix', -50)).toBe(50)
  })

  it('makes transfers and payments negative', () => {
    expect(amountForType('Transferência', 100)).toBe(-100)
    expect(amountForType('Pagamento', 25)).toBe(-25)
  })
})
