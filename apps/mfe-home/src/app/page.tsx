'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Button,
  Select,
  Typography,
  Input,
  Paper,
  TransactionItem,
  Modal,
  Menu,
  EditTransactionModal,
} from '@bytebank/ui'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { Transaction, TransactionType } from '@bytebank/shared'
import {
  formatDisplayDate,
  groupTransactionsByMonth,
  totalBalance,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '@bytebank/shared'
import styles from './page.module.scss'

const transactionFormOptions: { value: TransactionType; label: string }[] = (
  [
    'Depósito',
    'Pix',
    'Transferência',
    'Pagamento',
  ] as const satisfies readonly TransactionType[]
).map((value) => ({ value, label: value }))

function parseBRLAmount(raw: string): number | null {
  const s0 = raw.trim()
  if (!s0) return null
  // Remove tudo que não seja dígito, vírgula, ponto ou sinal
  const cleaned = s0.replace(/[^0-9,.-]/g, '')
  if (!cleaned) return null
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

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

function amountForType(type: TransactionType, absolute: number): number {
  if (type === 'Depósito' || type === 'Pix') return Math.abs(absolute)
  return -Math.abs(absolute)
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatHeaderDate(d = new Date()): string {
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' })
  const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${weekdayCap}, ${day}/${month}/${year}`
}

export default function Home() {
  const pathname = usePathname()
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>(
    'loading'
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formType, setFormType] = useState<TransactionType | ''>('')
  const [formDescription, setFormDescription] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Estado do modal (edit form)
  const [editFormType, setEditFormType] = useState<TransactionType | ''>('')
  const [editFormDescription, setEditFormDescription] = useState('')
  const [editFormAmount, setEditFormAmount] = useState('')

  function openEditModal(t: Transaction) {
    // Guarda a transação que será editada
    setEditingTransaction(t)

    // Preenche os campos do *modal* apenas
    setEditFormType(t.type)
    setEditFormDescription(t.name)
    const formatted = Math.abs(t.amount).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    setEditFormAmount(formatted)

    setIsEditModalOpen(true)
  }

  async function handleEditTransaction(e: React.SubmitEvent) {
    e.preventDefault()
    setEditError(null)

    if (!editingTransaction) return

    if (!editFormType) {
      setEditError('Selecione o tipo de transação.')
      return
    }

    const name = editFormDescription.trim()
    if (!name) {
      setEditError('Informe uma descrição.')
      return
    }
    const parsed = parseBRLAmount(editFormAmount)
    if (parsed === null || parsed === 0) {
      setEditError('Informe um valor válido.')
      return
    }

    const payload: Transaction = {
      id: editingTransaction.id,
      type: editFormType,
      name,
      amount: amountForType(editFormType, parsed),
      date: editingTransaction.date,
    }

    setEditLoading(true)
    try {
      const updated = await updateTransaction(editingTransaction.id, payload)

      // Atualiza o array localmente
      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      )

      // Fecha modal e limpa campos de edição
      setIsEditModalOpen(false)
      setEditingTransaction(null)
      setEditFormType('')
      setEditFormDescription('')
      setEditFormAmount('')
    } catch (err: unknown) {
      setEditError(
        err instanceof Error ? err.message : 'Não foi possível concluir.'
      )
    } finally {
      setEditLoading(false)
    }
  }

  async function handleEditModalSubmit(payload: {
    id?: string
    type: TransactionType
    name: string
    amount: number
  }) {
    if (!editingTransaction) return
    setEditLoading(true)
    setEditError(null)
    try {
      const updated = await updateTransaction(editingTransaction.id, {
        id: editingTransaction.id,
        type: payload.type,
        name: payload.name,
        amount: payload.amount,
        date: editingTransaction.date,
      })
      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      )
      setIsEditModalOpen(false)
      setEditingTransaction(null)
      setEditFormType('')
      setEditFormDescription('')
      setEditFormAmount('')
    } catch (err: unknown) {
      setEditError(
        err instanceof Error ? err.message : 'Não foi possível concluir.'
      )
    } finally {
      setEditLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    setLoadState('loading')
    getTransactions()
      .then((data) => {
        if (!cancelled) {
          setTransactions(data)
          setLoadState('idle')
          setLoadError(null)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setTransactions([])
          setLoadState('error')
          setLoadError(e instanceof Error ? e.message : 'Erro ao carregar.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const balance = useMemo(() => totalBalance(transactions), [transactions])

  const monthGroups = useMemo(
    () => groupTransactionsByMonth(transactions),
    [transactions]
  )

  const balanceLabel = balanceVisible
    ? balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ ••••••'

  async function handleNewTransaction(e: React.SubmitEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (!formType) {
      setSubmitError('Selecione o tipo de transação.')
      return
    }
    const name = formDescription.trim()
    if (!name) {
      setSubmitError('Informe uma descrição.')
      return
    }
    const parsed = parseBRLAmount(formAmount)
    if (parsed === null || parsed === 0) {
      setSubmitError('Informe um valor válido.')
      return
    }
    const payload: Omit<Transaction, 'id'> = {
      type: formType,
      name,
      amount: amountForType(formType, parsed),
      date: todayISO(),
    }
    setSubmitLoading(true)
    try {
      const created = await createTransaction(payload)
      setTransactions((prev) => [created, ...prev])
      setFormType('')
      setFormDescription('')
      setFormAmount('')
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : 'Não foi possível concluir.'
      )
    } finally {
      setSubmitLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Excluir esta transação?')) return
    try {
      await deleteTransaction(id)
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    } catch {
      window.alert('Não foi possível excluir.')
    }
  }

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <Menu currentPath={pathname} />
      </aside>

      <div className={styles.mainStack}>
        <Paper color="primary" classname={styles.welcome}>
          <div className={styles.welcomeLeft}>
            <Typography variant="title-lg" color="white" weight="bold">
              Olá, Joana! :)
            </Typography>
            <Typography
              variant="body-sm"
              color="white"
              classname={styles.dateMuted}
            >
              {formatHeaderDate()}
            </Typography>
          </div>
          <div className={styles.welcomeRight}>
            <div className={styles.balanceHeader}>
              <span className={styles.saldoLabel}>Saldo</span>
              <button
                type="button"
                className={`${styles.iconButton} ${styles.saldoIcon}`}
                onClick={() => setBalanceVisible((v) => !v)}
                aria-label={balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
              >
                {balanceVisible ? (
                  <MdVisibility size={22} />
                ) : (
                  <MdVisibilityOff size={22} />
                )}
              </button>
            </div>
            <div className={styles.saldoAccent} />
            <Typography variant="body-sm" color="white">
              Conta Corrente
            </Typography>
            <Typography variant="title-lg" color="white" weight="bold">
              {balanceLabel}
            </Typography>
          </div>
        </Paper>

        <Paper color="gray" classname={styles.formCard}>
          <form className={styles.formInner} onSubmit={handleNewTransaction}>
            <Typography
              variant="title-lg"
              color="active"
              weight="bold"
              classname={styles.formTitle}
            >
              Nova transação
            </Typography>
            <div className={styles.fieldGroup}>
              <label className={styles.labelMuted}>Tipo de transação:</label>
              <Select
                id="tipoTransacao"
                className={`${styles.selectFull} ${styles.formSelect}`}
                placeholder="Selecione o tipo de transação"
                options={transactionFormOptions}
                value={formType}
                onChange={(v) => setFormType(v as TransactionType)}
                disabled={submitLoading}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.labelMuted} htmlFor="descTransacao">
                Descrição:
              </label>
              <Input
                id="descTransacao"
                paddingSize="large"
                type="text"
                placeholder="Ex.: Aluguel, presente, salário…"
                className={styles.formDescriptionInput}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                disabled={submitLoading}
                autoComplete="off"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.labelMuted} htmlFor="valorTransacao">
                Valor:
              </label>
              <Input
                id="valorTransacao"
                paddingSize="large"
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                className={styles.formValueInput}
                value={formAmount ? `R$ ${formAmount}` : ''}
                onChange={(e) =>
                  setFormAmount(formatBRLFromDigits(e.target.value))
                }
                disabled={submitLoading}
              />
            </div>
            {submitError ? (
              <Typography
                variant="body-sm"
                color="error"
                classname={styles.formError}
              >
                {submitError}
              </Typography>
            ) : null}
            <Button
              type="submit"
              variant="default"
              size="large"
              className={styles.formSubmit}
              disabled={submitLoading}
            >
              {submitLoading ? 'Enviando…' : 'Concluir transação'}
            </Button>
          </form>
        </Paper>

        {isEditModalOpen && editingTransaction && (
          <EditTransactionModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            initial={{
              id: editingTransaction.id,
              type: editingTransaction.type,
              name: editingTransaction.name,
              amount: editingTransaction.amount,
            }}
            onSubmit={handleEditModalSubmit}
          />
        )}
      </div>

      <div className={styles.extratoColumn}>
        <Paper classname={styles.extrato}>
          <div className={styles.extratoHeader}>
            <Typography variant="title-lg" color="active" weight="bold">
              Extrato
            </Typography>
          </div>
          {loadState === 'loading' ? (
            <Typography variant="body-sm" color="active">
              Carregando extrato…
            </Typography>
          ) : null}
          {loadState === 'error' ? (
            <Typography variant="body-sm" color="error">
              {loadError}
            </Typography>
          ) : null}
          {loadState === 'idle' && monthGroups.length === 0 ? (
            <Typography variant="body-sm" color="active">
              Nenhuma transação encontrada.
            </Typography>
          ) : null}
          {monthGroups.map((group) => (
            <div key={group.key} className={styles.monthBlock}>
              <Typography
                variant="title-sm"
                color="active"
                weight="bold"
                classname={styles.monthTitle}
              >
                {group.label}
              </Typography>
              <div className={styles.list}>
                {group.items.map((t) => (
                  <TransactionItem
                    key={t.id}
                    type={t.type}
                    amount={t.amount}
                    date={formatDisplayDate(t.date)}
                    name={t.name}
                    menuPlacement="home-stacked-date"
                    menuItems={[
                      {
                        id: 'edit',
                        label: 'Editar',
                        onClick: () => openEditModal(t),
                      },
                      {
                        id: 'delete',
                        label: 'Excluir',
                        onClick: () => handleDelete(t.id),
                      },
                    ]}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className={styles.seeMoreWrapper}>
            <Link href="/transactions" className={styles.seeMoreLink}>
              Ver mais
            </Link>
          </div>
        </Paper>
      </div>
    </main>
  )
}
