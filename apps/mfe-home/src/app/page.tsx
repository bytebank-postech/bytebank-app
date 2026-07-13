'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Button,
  Chart,
  chartTheme,
  transactionTypeColors,
  Select,
  Typography,
  Input,
  Paper,
  TransactionItem,
  Menu,
  EditTransactionModal,
} from '@bytebank/ui'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { Transaction, TransactionCategory, TransactionType } from '@bytebank/shared'
import {
  formatDisplayDate,
  groupTransactionsByMonth,
  totalBalance,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  useAuth,
  suggestTransactionCategory,
  transactionCategories,
  uploadTransactionAttachments,
  deleteTransactionAttachment,
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

function buildMonthlyFlowData(transactions: Transaction[]) {
  const months = new Map<string, { Receitas: number; Despesas: number }>()
  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7)
    const entry = months.get(month) ?? { Receitas: 0, Despesas: 0 }
    if (transaction.amount >= 0) entry.Receitas += transaction.amount
    else entry.Despesas += Math.abs(transaction.amount)
    months.set(month, entry)
  }

  return [...months.entries()].sort().map(([month, values]) => ({
    name: new Date(`${month}-01T12:00:00`).toLocaleDateString('pt-BR', {
      month: 'short',
      year: '2-digit',
    }),
    ...values,
  }))
}

function buildTypeDistributionData(transactions: Transaction[]) {
  const types = new Map<TransactionType, number>()
  for (const transaction of transactions) {
    types.set(
      transaction.type,
      (types.get(transaction.type) ?? 0) + Math.abs(transaction.amount)
    )
  }
  return [...types.entries()].map(([name, value]) => ({
    name,
    value,
    fill: transactionTypeColors[name],
  }))
}

export default function Home() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>(
    'loading'
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formType, setFormType] = useState<TransactionType | ''>('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState<TransactionCategory>('Outros')
  const [categoryTouched, setCategoryTouched] = useState(false)
  const [formFiles, setFormFiles] = useState<File[]>([])
  const [formAmount, setFormAmount] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  function openEditModal(t: Transaction) {
    setEditingTransaction(t)
    setIsEditModalOpen(true)
  }

  async function handleEditModalSubmit(payload: {
    id?: string
    type: TransactionType
    name: string
    amount: number
    category: TransactionCategory
    files: File[]
  }) {
    if (!editingTransaction) return
    const updated = await updateTransaction(editingTransaction.id, {
      id: editingTransaction.id,
      type: payload.type,
      name: payload.name,
      amount: payload.amount,
      date: editingTransaction.date,
      category: payload.category,
    })
    const attachments = await uploadTransactionAttachments(editingTransaction.id, payload.files)
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...updated, attachments: [...(updated.attachments ?? []), ...attachments] }
          : t
      )
    )
    setIsEditModalOpen(false)
    setEditingTransaction(null)
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

  useEffect(() => {
    if (!categoryTouched) setFormCategory(suggestTransactionCategory(formDescription))
  }, [formDescription, categoryTouched])

  const balance = useMemo(() => totalBalance(transactions), [transactions])
  const monthlyFlowData = useMemo(
    () => buildMonthlyFlowData(transactions),
    [transactions]
  )
  const typeDistributionData = useMemo(
    () => buildTypeDistributionData(transactions),
    [transactions]
  )

  const monthGroups = useMemo(() => {
    const groups = groupTransactionsByMonth(transactions)
    let remaining = 5
    const preview = []

    for (const group of groups) {
      if (remaining <= 0) break
      const items = group.items.slice(0, remaining)
      remaining -= items.length
      preview.push({ ...group, items })
    }

    return preview
  }, [transactions])

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
      category: formCategory,
    }
    setSubmitLoading(true)
    try {
      const created = await createTransaction(payload)
      const attachments = await uploadTransactionAttachments(created.id, formFiles)
      setTransactions((prev) => [
        { ...created, attachments },
        ...prev,
      ])
      setFormType('')
      setFormDescription('')
      setFormAmount('')
      setFormCategory('Outros')
      setCategoryTouched(false)
      setFormFiles([])
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
              {user ? `Olá, ${user.name.split(' ')[0]}! :)` : 'Olá!'}
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

        <section className={styles.analytics} aria-label="Análises financeiras">
          <Paper classname={styles.chartCard}>
            <Chart
              title="Receitas x Despesas"
              type="line"
              series={[
                {
                  name: 'Receitas',
                  key: 'Receitas',
                  color: chartTheme.series.receitas,
                },
                {
                  name: 'Despesas',
                  key: 'Despesas',
                  color: chartTheme.series.despesas,
                },
              ]}
              axis={{ x: { key: 'name', show: true }, y: { show: true } }}
              data={monthlyFlowData}
            />
          </Paper>
          <Paper classname={styles.chartCard}>
            <Chart
              title="Distribuição por tipo"
              type="pie"
              series={[{ name: 'Movimentações', key: 'value' }]}
              axis={{ x: { show: false }, y: { show: false } }}
              data={typeDistributionData}
            />
          </Paper>
        </section>

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
              <label className={styles.labelMuted}>Categoria:</label>
              <Select
                className={`${styles.selectFull} ${styles.formSelect}`}
                options={transactionCategories.map((value) => ({ value, label: value }))}
                value={formCategory}
                onChange={(value) => {
                  setCategoryTouched(true)
                  setFormCategory(value as TransactionCategory)
                }}
                disabled={submitLoading}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.labelMuted} htmlFor="transaction-files">
                Anexos:
              </label>
              <Input
                id="transaction-files"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                multiple
                onChange={(event) => setFormFiles(Array.from(event.target.files ?? []))}
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
                category: editingTransaction.category,
                attachments: editingTransaction.attachments,
            }}
            onSubmit={handleEditModalSubmit}
            onRemoveAttachment={async (attachmentId) => {
              if (!editingTransaction) return
              await deleteTransactionAttachment(editingTransaction.id, attachmentId)
              setTransactions((current) =>
                current.map((transaction) =>
                  transaction.id === editingTransaction.id
                    ? {
                        ...transaction,
                        attachments: (transaction.attachments ?? []).filter(
                          (attachment) => attachment.id !== attachmentId
                        ),
                      }
                    : transaction
                )
              )
            }}
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
            <a href="/transactions" className={styles.seeMoreLink}>
              Ver mais
            </a>
          </div>
        </Paper>
      </div>
    </main>
  )
}
