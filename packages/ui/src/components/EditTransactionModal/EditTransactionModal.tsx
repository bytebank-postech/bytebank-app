'use client'

import Modal from '../ui/Modal/Modal'
import { Input, Select, Typography, Button } from '../ui'
import styles from './EditTransactionModal.module.scss'
import type { TransactionType } from '@bytebank/shared'
import { useState } from 'react'

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, '')
}

function formatBRLFromDigits(raw: string): string {
  const digits = digitsOnly(raw)
  if (!digits) return ''
  const cents = Number(digits)
  const value = cents / 100
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseBRLAmount(raw: string): number | null {
  const s0 = raw.trim()
  if (!s0) return null
  const cleaned = s0.replace(/[^0-9,.-]/g, '')
  if (!cleaned) return null
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

function amountForType(type: TransactionType, absolute: number): number {
  if (type === 'Depósito' || type === 'Pix') return Math.abs(absolute)
  return -Math.abs(absolute)
}

interface Props {
  isOpen: boolean
  onClose: () => void
  initial?: { id?: string; type: TransactionType; name: string; amount: number }
  onSubmit: (payload: {
    id?: string
    type: TransactionType
    name: string
    amount: number
  }) => Promise<void>
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const [type, setType] = useState<TransactionType | ''>(initial?.type ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(() => {
    if (initial == null) return ''
    return Math.abs(initial.amount).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!type) return setError('Selecione o tipo de transação.')
    const trimmed = name.trim()
    if (!trimmed) return setError('Informe uma descrição.')
    const parsed = parseBRLAmount(amount)
    if (parsed === null || parsed === 0)
      return setError('Informe um valor válido.')
    setLoading(true)
    try {
      await onSubmit({
        id: initial?.id,
        type,
        name: trimmed,
        amount: amountForType(type, parsed),
      })
      onClose()
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível concluir.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className={styles.formInner} onSubmit={handleSubmit}>
        <Typography
          variant="title-lg"
          color="white"
          weight="bold"
          classname={styles.formTitle}
        >
          Editar transação
        </Typography>

        <div className={styles.fieldGroup}>
          <span className={styles.labelMuted}>Tipo de transação:</span>
          <Select
            className={`${styles.selectFull} ${styles.formSelect}`}
            placeholder="Selecione o tipo de transação"
            options={(
              ['Depósito', 'Pix', 'Transferência', 'Pagamento'] as const
            ).map((v) => ({ value: v, label: v }))}
            value={type}
            onChange={(v) => setType(v as TransactionType)}
            disabled={loading}
          />
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.labelMuted}>Descrição:</span>
          <Input
            paddingSize="medium"
            type="text"
            placeholder="Ex.: Aluguel, presente, salário…"
            className={styles.formDescriptionInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.labelMuted}>Valor:</span>
          <Input
            paddingSize="medium"
            type="text"
            inputMode="decimal"
            placeholder="R$ 0,00"
            className={styles.formValueInput}
            value={amount ? `R$ ${amount}` : ''}
            onChange={(e) => setAmount(formatBRLFromDigits(e.target.value))}
            disabled={loading}
          />
        </div>

        {error && (
          <Typography
            variant="body-sm"
            color="error"
            classname={styles.formError}
          >
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="default"
          size="medium"
          className={styles.formSubmit}
          disabled={loading}
        >
          {loading ? 'Atualizando…' : 'Salvar alterações'}
        </Button>
      </form>
    </Modal>
  )
}
