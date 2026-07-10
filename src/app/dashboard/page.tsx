'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import Menu from '@/components/layout/Menu/Menu'
import { Chart, Paper, Typography } from '@/components'
import { chartTheme } from '@/components/ui/Chart/Chart.theme'
import type { Transaction } from '@/types/transaction'
import { getTransactions } from '@/services/transactions'
import { buildMonthlyFlowData, buildTypeDistributionData } from './model'
import styles from './page.module.scss'

export default function DashboardPage() {
  const pathname = usePathname()
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
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setTransactions([])
          setLoadState('error')
          setLoadError(
            err instanceof Error ? err.message : 'Não foi possível carregar.'
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const monthlyFlowData = useMemo(
    () => buildMonthlyFlowData(transactions),
    [transactions]
  )

  const typeDistributionData = useMemo(
    () => buildTypeDistributionData(transactions),
    [transactions]
  )

  const hasData = transactions.length > 0

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <Menu currentPath={pathname} />
      </aside>

      <section className={styles.content}>
        <Paper classname={styles.card}>
          <div className={styles.header}>
            <Typography variant="title-lg" color="active" weight="bold">
              Dashboard
            </Typography>
          </div>

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

          {loadState === 'idle' && !hasData ? (
            <Typography
              variant="body-sm"
              color="active"
              classname={styles.emptyState}
            >
              Nenhuma transação encontrada para exibir os gráficos.
            </Typography>
          ) : null}

          {loadState === 'idle' && hasData ? (
            <div className={styles.charts}>
              <Paper classname={styles.chartCardLine}>
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
                  axis={{
                    x: { key: 'name', show: true },
                    y: { key: 'value', show: true },
                  }}
                  data={monthlyFlowData}
                />
              </Paper>

              <Paper classname={styles.chartCardPie}>
                <Chart
                  title="Distribuição por tipo"
                  type="pie"
                  series={[
                    {
                      name: 'Movimentações',
                      key: 'value',
                    },
                  ]}
                  axis={{
                    x: { key: 'name', show: false },
                    y: { key: 'value', show: false },
                  }}
                  data={typeDistributionData}
                />
              </Paper>
            </div>
          ) : null}
        </Paper>
      </section>
    </main>
  )
}
