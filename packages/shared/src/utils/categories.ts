import type { TransactionCategory } from '../types/transaction'

const suggestions: Array<[RegExp, TransactionCategory]> = [
  [/aluguel|condomínio|luz|água|internet/i, 'Moradia'],
  [/mercado|restaurante|ifood|lanche|padaria/i, 'Alimentação'],
  [/uber|ônibus|combustível|gasolina/i, 'Transporte'],
  [/farmácia|médico|consulta|hospital/i, 'Saúde'],
  [/cinema|show|streaming|viagem/i, 'Lazer'],
  [/curso|livro|faculdade|escola/i, 'Educação'],
  [/salário|pagamento recebido|freelance/i, 'Salário'],
  [/pix|transferência/i, 'Transferências'],
]

export const transactionCategories: TransactionCategory[] = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Educação',
  'Salário',
  'Transferências',
  'Outros',
]

export function suggestTransactionCategory(description: string) {
  return suggestions.find(([pattern]) => pattern.test(description))?.[1] ?? 'Outros'
}
