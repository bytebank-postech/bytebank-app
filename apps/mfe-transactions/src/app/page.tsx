'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Paper,
  Typography,
  TransactionItem,
  Input,
  Select,
  Menu,
  Datepicker,
  Pagination,
} from '@bytebank/ui'
import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from '@bytebank/domain'
import { formatDisplayDate } from '@bytebank/domain'
import {
  useSelection,
  useTransactionCollection,
  useTransactionFilters,
  useTransactionMutations,
} from '@bytebank/shared'
import { MdDelete, MdFilterAltOff, MdManageSearch } from 'react-icons/md'
import LazyEditTransactionModal from '../components/LazyEditTransactionModal'
import styles from './page.module.scss'

const TRANSACTION_TYPE_OPTIONS = [
  'Todos',
  'Transferência',
  'Pagamento',
  'Depósito',
  'Pix',
].map((type) => ({ label: type, value: type }))

type TransactionRowProps = {
  transaction: Transaction
  selectable: boolean
  selected: boolean
  onToggleSelected: (id: string, selected: boolean) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const TransactionRow = memo(function TransactionRow({
  transaction,
  selectable,
  selected,
  onToggleSelected,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const handleSelectedChange = useCallback(
    (next: boolean) => onToggleSelected(transaction.id, next),
    [onToggleSelected, transaction.id]
  )

  const menuItems = useMemo(() => {
    if (selectable) return undefined

    return [
      {
        id: 'edit',
        label: 'Editar',
        onClick: () => onEdit(transaction),
      },
      {
        id: 'delete',
        label: 'Excluir',
        onClick: () => onDelete(transaction.id),
      },
    ]
  }, [selectable, onEdit, onDelete, transaction])

  return (
    <TransactionItem
      type={transaction.type}
      amount={transaction.amount}
      date={formatDisplayDate(transaction.date)}
      name={transaction.name}
      menuPlacement="home-stacked-date"
      selectable={selectable}
      selected={selected}
      onSelectedChange={handleSelectedChange}
      menuItems={menuItems}
    />
  )
})

export default function TransactionsPage() {
  const { transactions, monthGroups, status, error, totalItems, totalPages } =
    useTransactionCollection('page')
  const filters = useTransactionFilters()
  const mutations = useTransactionMutations()

  const visibleIds = useMemo(
    () => transactions.map((transaction) => transaction.id),
    [transactions]
  )
  const selection = useSelection(visibleIds)

  const [isSearchActive, setIsSearchActive] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const { handleSearchChange, handleClearFilters } = filters

  useEffect(() => {
    if (isSearchActive) searchInputRef.current?.focus()
  }, [isSearchActive])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!isSearchActive || editingTransaction) return

        handleSearchChange('')
        setIsSearchActive(false)
        return
      }

      const isSearchShortcut =
        (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'f') ||
        (event.metaKey && event.key === '/')

      if (isSearchShortcut) {
        event.preventDefault()
        setIsSearchActive(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editingTransaction, handleSearchChange, isSearchActive])

  const handleToggleSearch = useCallback(() => {
    setIsSearchActive((current) => {
      if (current) handleSearchChange('')

      return !current
    })
  }, [handleSearchChange])

  const handleResetFilters = useCallback(() => {
    handleClearFilters()
    setIsSearchActive(false)
  }, [handleClearFilters])

  const handleCloseEditModal = useCallback(() => {
    setEditingTransaction(null)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('Excluir esta transação?')) return

      void mutations.remove([id])
    },
    [mutations]
  )

  const handleTrashClick = useCallback(() => {
    if (!selection.isActive) {
      selection.handleEnable()
      return
    }

    if (selection.selectedCount === 0) {
      selection.handleDisable()
      return
    }

    const confirmed = window.confirm(
      `Excluir ${selection.selectedCount} transação(ões) selecionada(s)?`
    )
    if (!confirmed) return

    void mutations.remove(selection.selectedIds).finally(selection.handleDisable)
  }, [mutations, selection])

  const handleToggleAll = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      selection.handleToggleAll(event.target.checked)
    },
    [selection]
  )

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

  const trashLabel = selection.isActive
    ? selection.selectedCount > 0
      ? 'Confirmar exclusão das selecionadas'
      : 'Cancelar exclusão em massa'
    : 'Exclusão em massa'

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <Menu currentPath="/transactions" />
      </aside>

      <section className={styles.content}>
        <Paper classname={styles.card}>
          <div className={styles.header}>
            <Typography variant="title-lg" color="active" weight="bold">
              Transações
            </Typography>
            <div className={styles.actions}>
              <div className={styles.filterControls}>
                <Select
                  options={TRANSACTION_TYPE_OPTIONS}
                  placeholder="Filtrar por Tipo"
                  value={filters.type}
                  onChange={(value) =>
                    filters.handleTypeChange(value as TransactionType | 'Todos')
                  }
                />
              </div>
              <div className={styles.filterControls}>
                <Datepicker
                  id="transaction-month-filter"
                  aria-label="Filtrar por mês"
                  className={styles.monthInput}
                  type="month"
                  value={filters.month === 'Todos' ? '' : filters.month}
                  onChange={(event) =>
                    filters.handleMonthChange(event.target.value || 'Todos')
                  }
                />
              </div>

              {isSearchActive && (
                <div className={styles.searchBar}>
                  <Input
                    ref={searchInputRef}
                    placeholder="Buscar por nome ou tipo..."
                    value={filters.search}
                    onChange={(event) =>
                      filters.handleSearchChange(event.target.value)
                    }
                  />
                </div>
              )}
              <Button
                variant="rounded"
                icon={<MdManageSearch size={20} />}
                onClick={handleToggleSearch}
                aria-label={
                  isSearchActive ? 'Limpar filtro' : 'Buscar transações'
                }
              />
              {filters.hasActiveFilters && (
                <Button
                  variant="rounded"
                  icon={<MdFilterAltOff size={20} />}
                  onClick={handleResetFilters}
                  aria-label="Limpar todos os filtros"
                />
              )}
              <Button
                variant="rounded"
                icon={<MdDelete size={20} />}
                onClick={handleTrashClick}
                aria-label={trashLabel}
              />
            </div>
          </div>

          {selection.isActive ? (
            <div className={styles.bulkRow}>
              <label
                className={styles.bulkCheckboxWrapper}
                aria-label="Selecionar todos"
              >
                <input
                  className={styles.bulkCheckboxInput}
                  type="checkbox"
                  checked={selection.allSelected}
                  onChange={handleToggleAll}
                />
                <span className={styles.bulkCheckboxBox} aria-hidden="true" />
              </label>
              <span className={styles.bulkLabel}>Selecionar todos</span>
            </div>
          ) : null}

          {status === 'loading' ? (
            <Typography variant="body-sm" color="active">
              Carregando…
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
          {status === 'success' && monthGroups.length === 0 ? (
            <Typography variant="body-sm" color="active">
              Nenhuma transação encontrada.
            </Typography>
          ) : null}

          {monthGroups.map((group) => (
            <div key={group.key} className={styles.monthBlock}>
              <Typography variant="title-sm" color="active" weight="bold">
                {group.label}
              </Typography>
              <div className={styles.list}>
                {group.items.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    selectable={selection.isActive}
                    selected={selection.isSelected(transaction.id)}
                    onToggleSelected={selection.handleToggle}
                    onEdit={setEditingTransaction}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}

          {status === 'success' && totalPages > 1 ? (
            <Pagination
              currentPage={filters.page}
              totalItems={totalItems}
              pageSize={filters.pageSize}
              onPageChange={filters.handlePageChange}
            />
          ) : null}

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
        </Paper>
      </section>
    </main>
  )
}
