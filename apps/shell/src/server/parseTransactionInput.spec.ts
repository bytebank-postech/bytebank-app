import { describe, expect, it } from 'vitest'
import {
  parseCreateTransactionInput,
  parseUpdateTransactionInput,
} from './parseTransactionInput'

const validInput = {
  type: 'Pix',
  name: '  Freela  ',
  amount: 900,
  date: '2026-03-12',
  category: 'Salário',
}

describe('parseCreateTransactionInput', () => {
  it('aceita somente os campos permitidos e normaliza a descrição', () => {
    const parsed = parseCreateTransactionInput({
      ...validInput,
      id: 'forjado',
      ownerId: 'outro-usuario',
      attachments: [{ id: 'x', url: 'https://malicioso.example' }],
    })

    expect(parsed).toEqual({ ...validInput, name: 'Freela' })
  })

  it('aceita transação sem categoria', () => {
    const { category, ...withoutCategory } = validInput
    void category

    expect(parseCreateTransactionInput(withoutCategory)).not.toHaveProperty(
      'category'
    )
  })

  it.each([
    ['tipo', { type: 'Saque' }, 'Tipo de transação inválido.'],
    ['descrição vazia', { name: '   ' }, 'A descrição deve ter entre 1 e 120 caracteres.'],
    ['valor não numérico', { amount: '100' }, 'Valor da transação inválido.'],
    ['valor infinito', { amount: Number.POSITIVE_INFINITY }, 'Valor da transação inválido.'],
    ['data inválida', { date: '12/03/2026' }, 'Data da transação inválida.'],
    ['categoria', { category: 'Cassino' }, 'Categoria inválida.'],
  ])('rejeita %s', (_label, override, message) => {
    expect(() =>
      parseCreateTransactionInput({ ...validInput, ...override })
    ).toThrow(message)
  })

  it('rejeita corpo que não é objeto', () => {
    expect(() => parseCreateTransactionInput([])).toThrow(
      'Corpo da requisição inválido.'
    )
  })
})

describe('parseUpdateTransactionInput', () => {
  it('valida apenas os campos enviados e descarta os demais', () => {
    expect(
      parseUpdateTransactionInput({ id: 'x', amount: -50, ownerId: 'y' })
    ).toEqual({ amount: -50 })
  })

  it('rejeita valores inválidos nos campos enviados', () => {
    expect(() => parseUpdateTransactionInput({ type: 'Saque' })).toThrow(
      'Tipo de transação inválido.'
    )
  })
})
