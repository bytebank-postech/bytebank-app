import { ValidationError } from '@bytebank/application'
import {
  transactionCategories,
  type Transaction,
  type TransactionCategory,
  type TransactionType,
} from '@bytebank/domain'

type TransactionInput = Omit<Transaction, 'id' | 'attachments'>

const TRANSACTION_TYPES: TransactionType[] = [
  'Transferência',
  'Pix',
  'Depósito',
  'Pagamento',
]
const MAX_NAME_LENGTH = 120
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseType = (value: unknown): TransactionType => {
  if (TRANSACTION_TYPES.includes(value as TransactionType)) {
    return value as TransactionType
  }
  throw new ValidationError('Tipo de transação inválido.')
}

const parseName = (value: unknown): string => {
  const name = typeof value === 'string' ? value.trim() : ''
  if (name && name.length <= MAX_NAME_LENGTH) return name
  throw new ValidationError(
    `A descrição deve ter entre 1 e ${MAX_NAME_LENGTH} caracteres.`
  )
}

const parseAmount = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  throw new ValidationError('Valor da transação inválido.')
}

const parseDate = (value: unknown): string => {
  const isValidDate =
    typeof value === 'string' &&
    ISO_DATE_PATTERN.test(value) &&
    !Number.isNaN(Date.parse(value))
  if (isValidDate) return value
  throw new ValidationError('Data da transação inválida.')
}

const parseCategory = (value: unknown): TransactionCategory => {
  if (transactionCategories.includes(value as TransactionCategory)) {
    return value as TransactionCategory
  }
  throw new ValidationError('Categoria inválida.')
}

const fieldParsers = {
  type: parseType,
  name: parseName,
  amount: parseAmount,
  date: parseDate,
  category: parseCategory,
} satisfies {
  [Field in keyof TransactionInput]-?: (value: unknown) => TransactionInput[Field]
}

const parseFields = (
  body: Record<string, unknown>,
  fields: Array<keyof TransactionInput>
): Partial<TransactionInput> =>
  Object.fromEntries(
    fields.map((field) => [field, fieldParsers[field](body[field])])
  )

const providedFields = (body: Record<string, unknown>) =>
  (Object.keys(fieldParsers) as Array<keyof TransactionInput>).filter(
    (field) => body[field] !== undefined && body[field] !== null
  )

export const parseCreateTransactionInput = (
  body: unknown
): TransactionInput => {
  if (!isRecord(body)) throw new ValidationError('Corpo da requisição inválido.')

  const requiredFields: Array<keyof TransactionInput> = [
    'type',
    'name',
    'amount',
    'date',
  ]
  const optionalFields = providedFields(body).filter(
    (field) => !requiredFields.includes(field)
  )

  return parseFields(body, [
    ...requiredFields,
    ...optionalFields,
  ]) as TransactionInput
}

export const parseUpdateTransactionInput = (
  body: unknown
): Partial<TransactionInput> => {
  if (!isRecord(body)) throw new ValidationError('Corpo da requisição inválido.')
  return parseFields(body, providedFields(body))
}

export const readJsonBody = async (request: Request): Promise<unknown> => {
  try {
    return await request.json()
  } catch {
    throw new ValidationError('Corpo da requisição inválido.')
  }
}
