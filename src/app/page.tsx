'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Menu from '@/components/layout/Menu/Menu'
import {
  Button,
  Select,
  Typography,
  Input,
  Paper,
  TransactionItem,
} from '@/components'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { Transaction, TransactionType } from '@/types/transaction'
import {
  formatDisplayDate,
  groupTransactionsByMonth,
  totalBalance,
} from '@/app/transactions/model'
import { createTransaction, getTransactions } from '@/services/transactions'
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
  const s = raw.trim()
  if (!s) return null
  const normalized = s.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
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

  async function handleNewTransaction(e: React.FormEvent) {
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
              Quinta-feira, 08/09/2024
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
              color="white"
              weight="bold"
              classname={styles.formTitle}
            >
              Nova transação
            </Typography>
            <div className={styles.fieldGroup}>
              <span className={styles.labelMuted}>Tipo de transação:</span>
              <Select
                className={`${styles.selectFull} ${styles.formSelect}`}
                placeholder="Selecione o tipo de transação"
                options={transactionFormOptions}
                value={formType}
                onChange={(v) => setFormType(v as TransactionType)}
                disabled={submitLoading}
              />
            </div>
            <div className={styles.fieldGroup}>
              <span className={styles.labelMuted}>Descrição:</span>
              <Input
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
              <span className={styles.labelMuted}>Valor:</span>
              <Input
                paddingSize="large"
                type="text"
                inputMode="decimal"
                placeholder="00,00"
                className={styles.formValueInput}
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
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
                      { id: 'edit', label: 'Editar', onClick: () => {} },
                      { id: 'delete', label: 'Excluir', onClick: () => {} },
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
