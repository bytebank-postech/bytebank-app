'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Button,
  chartTheme,
  transactionTypeColors,
  Select,
  Typography,
  Input,
  Paper,
  TransactionItem,
  Menu,
  Modal,
} from '@bytebank/ui'
import { MdOpenInFull, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from '@bytebank/domain'
import { formatDisplayDate, transactionCategories } from '@bytebank/domain'
import {
  toError,
  useAuth,
  useBalanceVisibility,
  useDashboardAnalytics,
  useTransactionCollection,
  useTransactionMutations,
  useTransactionNavigationPrefetch,
} from '@bytebank/shared'
import { useNewTransactionForm } from '../hooks/useNewTransactionForm'
import LazyChart from '../components/LazyChart'
import LazyEditTransactionModal from '../components/LazyEditTransactionModal'
import styles from './page.module.scss'

const TRANSACTION_FORM_OPTIONS: { value: TransactionType; label: string }[] = (
  [
    'Depósito',
    'Pix',
    'Transferência',
    'Pagamento',
  ] as const satisfies readonly TransactionType[]
).map((value) => ({ value, label: value }))

const CATEGORY_OPTIONS = transactionCategories.map((value) => ({
  value,
  label: value,
}))

function formatHeaderDate(date = new Date()): string {
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day}/${month}/${date.getFullYear()}`
}

const MONTHLY_FLOW_SERIES = [
  { name: 'Receitas', key: 'Receitas', color: chartTheme.series.receitas },
  { name: 'Despesas', key: 'Despesas', color: chartTheme.series.despesas },
]

const MONTHLY_FLOW_AXIS = {
  x: { key: 'name', show: true },
  y: { show: true },
}

const TYPE_DISTRIBUTION_SERIES = [{ name: 'Movimentações', key: 'value' }]

const TYPE_DISTRIBUTION_AXIS = { x: { show: false }, y: { show: false } }

type StatementRowProps = {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const StatementRow = memo(function StatementRow({
  transaction,
  onEdit,
  onDelete,
}: StatementRowProps) {
  const menuItems = useMemo(
    () => [
      { id: 'edit', label: 'Editar', onClick: () => onEdit(transaction) },
      {
        id: 'delete',
        label: 'Excluir',
        onClick: () => onDelete(transaction.id),
      },
    ],
    [onEdit, onDelete, transaction]
  )

  return (
    <TransactionItem
      type={transaction.type}
      amount={transaction.amount}
      date={formatDisplayDate(transaction.date)}
      name={transaction.name}
      menuPlacement="home-stacked-date"
      menuItems={menuItems}
    />
  )
})

export default function Home() {
  const pathname = usePathname()
  const { user } = useAuth()

  const { status, error } = useTransactionCollection('all')
  const { balance, monthlyFlow, typeDistribution, statementPreview } =
    useDashboardAnalytics()
  const mutations = useTransactionMutations()
  const prefetchTransactions = useTransactionNavigationPrefetch()
  const balanceVisibility = useBalanceVisibility()
  const form = useNewTransactionForm()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)

  const typeDistributionData = useMemo(
    () =>
      typeDistribution.map((slice) => ({
        ...slice,
        fill: transactionTypeColors[slice.name],
      })),
    [typeDistribution]
  )

  const balanceLabel = balanceVisibility.isVisible
    ? balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ ••••••'

  const { buildDraft, handleReset } = form

  const handleNewTransaction = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setSubmitError(null)

      const draft = buildDraft()
      if (!draft.ok) {
        setSubmitError(draft.message)
        return
      }

      try {
        await mutations.create(draft.data, draft.files)
        handleReset()
      } catch (reason) {
        setSubmitError(toError(reason, 'Não foi possível concluir.').message)
      }
    },
    [buildDraft, handleReset, mutations]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('Excluir esta transação?')) return

      void mutations.remove([id])
    },
    [mutations]
  )

  const handleCloseEditModal = useCallback(() => {
    setEditingTransaction(null)
  }, [])

  const handleEditSubmit = useCallback(
    async (payload: {
      id?: string
      type: TransactionType
      name: string
      amount: number
      category: TransactionCategory
      files: File[]
    }) => {
      if (!editingTransaction) return

      await mutations.update(
        editingTransaction.id,
        {
          id: editingTransaction.id,
          type: payload.type,
          name: payload.name,
          amount: payload.amount,
          date: editingTransaction.date,
          category: payload.category,
        },
        payload.files
      )

      setEditingTransaction(null)
    },
    [editingTransaction, mutations]
  )

  const handleRemoveAttachment = useCallback(
    async (attachmentId: string) => {
      if (!editingTransaction) return

      await mutations.removeAttachment(editingTransaction.id, attachmentId)
    },
    [editingTransaction, mutations]
  )

  const handleOpenAnalytics = useCallback(() => {
    setIsAnalyticsModalOpen(true)
  }, [])

  const handleCloseAnalytics = useCallback(() => {
    setIsAnalyticsModalOpen(false)
  }, [])

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <Menu currentPath={pathname} onTransactionsIntent={prefetchTransactions} />
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
                onClick={balanceVisibility.handleToggle}
                aria-label={
                  balanceVisibility.isVisible
                    ? 'Ocultar saldo'
                    : 'Mostrar saldo'
                }
              >
                {balanceVisibility.isVisible ? (
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

        <div className={styles.analyticsHeader}>
          <Typography variant="title-lg" color="active" weight="bold">
            Análises financeiras
          </Typography>
          <Button
            type="button"
            variant="outline"
            size="medium"
            onClick={handleOpenAnalytics}
          >
            <MdOpenInFull aria-hidden="true" size={18} /> Ampliar gráficos
          </Button>
        </div>

        <section className={styles.analytics} aria-label="Análises financeiras">
          <Paper classname={styles.chartCard}>
            <LazyChart
              title="Receitas x Despesas"
              type="line"
              series={MONTHLY_FLOW_SERIES}
              axis={MONTHLY_FLOW_AXIS}
              data={monthlyFlow}
            />
          </Paper>
          <Paper classname={styles.chartCard}>
            <LazyChart
              title="Distribuição por tipo"
              type="pie"
              series={TYPE_DISTRIBUTION_SERIES}
              axis={TYPE_DISTRIBUTION_AXIS}
              data={typeDistributionData}
            />
          </Paper>
        </section>

        <Modal
          isOpen={isAnalyticsModalOpen}
          onClose={handleCloseAnalytics}
          classname={styles.analyticsModal}
        >
          <section aria-label="Análises financeiras ampliadas">
            <Typography
              variant="title-lg"
              color="active"
              weight="bold"
              classname={styles.analyticsModalTitle}
            >
              Análises financeiras
            </Typography>
            <div className={styles.analyticsExpanded}>
              <Paper classname={styles.chartCard}>
                <LazyChart
                  enabled={isAnalyticsModalOpen}
                  placeholderHeight={420}
                  title="Receitas x Despesas"
                  type="line"
                  series={MONTHLY_FLOW_SERIES}
                  axis={MONTHLY_FLOW_AXIS}
                  data={monthlyFlow}
                />
              </Paper>
              <Paper classname={styles.chartCard}>
                <LazyChart
                  enabled={isAnalyticsModalOpen}
                  placeholderHeight={420}
                  title="Distribuição por tipo"
                  type="pie"
                  series={TYPE_DISTRIBUTION_SERIES}
                  axis={TYPE_DISTRIBUTION_AXIS}
                  data={typeDistributionData}
                />
              </Paper>
            </div>
          </section>
        </Modal>

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
              <label className={styles.labelMuted} htmlFor="tipoTransacao">
                Tipo de transação:
              </label>
              <Select
                id="tipoTransacao"
                className={`${styles.selectFull} ${styles.formSelect}`}
                placeholder="Selecione o tipo de transação"
                options={TRANSACTION_FORM_OPTIONS}
                value={form.values.type}
                onChange={(value) =>
                  form.handleTypeChange(value as TransactionType)
                }
                disabled={mutations.isMutating}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.labelMuted} htmlFor="categoriaTransacao">
                Categoria:
              </label>
              <Select
                id="categoriaTransacao"
                className={`${styles.selectFull} ${styles.formSelect}`}
                options={CATEGORY_OPTIONS}
                value={form.values.category}
                onChange={(value) =>
                  form.handleCategoryChange(value as TransactionCategory)
                }
                disabled={mutations.isMutating}
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
                onChange={(event) =>
                  form.handleFilesChange(Array.from(event.target.files ?? []))
                }
                disabled={mutations.isMutating}
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
                value={form.values.description}
                onChange={(event) =>
                  form.handleDescriptionChange(event.target.value)
                }
                disabled={mutations.isMutating}
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
                value={form.values.amount ? `R$ ${form.values.amount}` : ''}
                onChange={(event) =>
                  form.handleAmountChange(event.target.value)
                }
                disabled={mutations.isMutating}
              />
            </div>
            {submitError ? (
              <Typography
                variant="body-sm"
                color="error"
                classname={styles.formError}
                role="alert"
              >
                {submitError}
              </Typography>
            ) : null}
            <Button
              type="submit"
              variant="default"
              size="large"
              className={styles.formSubmit}
              disabled={mutations.isMutating}
            >
              {mutations.isMutating ? 'Enviando…' : 'Concluir transação'}
            </Button>
          </form>
        </Paper>

        {editingTransaction && (
          <LazyEditTransactionModal
            isOpen
            onClose={handleCloseEditModal}
            initial={{
              id: editingTransaction.id,
              type: editingTransaction.type,
              name: editingTransaction.name,
              amount: editingTransaction.amount,
              category: editingTransaction.category,
              attachments: editingTransaction.attachments,
            }}
            onSubmit={handleEditSubmit}
            onRemoveAttachment={handleRemoveAttachment}
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
          {status === 'loading' ? (
            <Typography variant="body-sm" color="active">
              Carregando extrato…
            </Typography>
          ) : null}
          {status === 'error' ? (
            <Typography variant="body-sm" color="error">
              {error}
            </Typography>
          ) : null}
          {mutations.error ? (
            <Typography variant="body-sm" color="error" role="alert">
              {mutations.error}
            </Typography>
          ) : null}
          {status === 'success' && statementPreview.length === 0 ? (
            <Typography variant="body-sm" color="active">
              Nenhuma transação encontrada.
            </Typography>
          ) : null}
          {statementPreview.map((group) => (
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
                {group.items.map((transaction) => (
                  <StatementRow
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={setEditingTransaction}
                    onDelete={handleDelete}
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
