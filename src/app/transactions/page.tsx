'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Menu from '@/components/layout/Menu/Menu'
import { Button, Paper, Typography, TransactionItem } from '@/components'
import { MdDelete } from 'react-icons/md'
import type { Transaction } from '@/types/transaction'
import { formatDisplayDate, groupTransactionsByMonth } from './model'
import { deleteTransaction, getTransactions } from '@/services/transactions'
import styles from './page.module.scss'

export default function TransactionsPage() {
  const pathname = usePathname()
  const router = useRouter()
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>(
    'loading'
  )
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
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

  const monthGroups = useMemo(
    () => groupTransactionsByMonth(transactions),
    [transactions]
  )

  const allSelected =
    bulkDeleteMode && transactions.length > 0
      ? transactions.every((i) => selectedIds[i.id])
      : false

  function setAllSelected(next: boolean) {
    if (!bulkDeleteMode) return
    if (!next) {
      setSelectedIds({})
      return
    }
    const map: Record<string, boolean> = {}
    for (const item of transactions) map[item.id] = true
    setSelectedIds(map)
  }

  const selectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds]
  )

  async function handleBulkDeleteSelected() {
    const ids = Object.entries(selectedIds)
      .filter(([, v]) => v)
      .map(([id]) => id)
    if (ids.length === 0) return
    if (!window.confirm(`Excluir ${ids.length} transação(ões) selecionada(s)?`))
      return
    try {
      await Promise.all(ids.map((id) => deleteTransaction(id)))
      setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)))
      setSelectedIds({})
      setBulkDeleteMode(false)
    } catch {
      window.alert('Não foi possível excluir.')
    }
  }

  function onTrashButtonClick() {
    if (!bulkDeleteMode) {
      setBulkDeleteMode(true)
      setSelectedIds({})
      return
    }
    if (selectedCount === 0) {
      setBulkDeleteMode(false)
      setSelectedIds({})
      return
    }
    void handleBulkDeleteSelected()
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
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <Menu currentPath={pathname} />
      </aside>

      <section className={styles.content}>
        <Paper classname={styles.card}>
          <div className={styles.header}>
            <Typography variant="title-lg" color="active" weight="bold">
              Transações
            </Typography>
            <div className={styles.actions}>
              <Button
                variant="rounded"
                icon={<MdDelete size={20} />}
                onClick={onTrashButtonClick}
                aria-label={
                  bulkDeleteMode
                    ? selectedCount > 0
                      ? 'Confirmar exclusão das selecionadas'
                      : 'Cancelar exclusão em massa'
                    : 'Exclusão em massa'
                }
              />
            </div>
          </div>

          {bulkDeleteMode ? (
            <div className={styles.bulkRow}>
              <label
                className={styles.bulkCheckboxWrapper}
                aria-label="Selecionar todos"
              >
                <input
                  className={styles.bulkCheckboxInput}
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => setAllSelected(e.target.checked)}
                />
                <span className={styles.bulkCheckboxBox} aria-hidden="true" />
              </label>
              <span className={styles.bulkLabel}>Selecionar todos</span>
            </div>
          ) : null}

          {loadState === 'loading' ? (
            <Typography variant="body-sm" color="active">
              Carregando…
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
              <Typography variant="title-sm" color="active" weight="bold">
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
                    selectable={bulkDeleteMode}
                    selected={!!selectedIds[t.id]}
                    onSelectedChange={(next) =>
                      setSelectedIds((prev) => ({ ...prev, [t.id]: next }))
                    }
                    menuItems={
                      bulkDeleteMode
                        ? undefined
                        : [
                            {
                              id: 'edit',
                              label: 'Editar',
                              onClick: () =>
                                router.push(`/transactions/${t.id}`),
                            },
                            {
                              id: 'delete',
                              label: 'Excluir',
                              onClick: () => void handleDelete(t.id),
                            },
                          ]
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </Paper>
      </section>
    </main>
  )
}
