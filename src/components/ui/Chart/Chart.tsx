'use client'

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
  Cell,
} from 'recharts'
import { RechartsDevtools } from '@recharts/devtools'
import { Typography } from '@/components'
import { ChartProps } from './Chart.types'
import { chartMap } from './Chart.config'
import { chartTheme } from './Chart.theme'
import styles from './Chart.module.scss'

type TooltipEntry = {
  name?: string
  value?: number | string
  color?: string
}

type ChartTooltipProps = {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className={styles.tooltip}>
      {label ? <p className={styles.tooltipLabel}>{label}</p> : null}
      <ul className={styles.tooltipList}>
        {payload.map((item) => (
          <li key={item.name} className={styles.tooltipItem}>
            <span
              className={styles.tooltipDot}
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}</span>
            <span className={styles.tooltipValue}>
              {typeof item.value === 'number'
                ? item.value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                : item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const axisTick = {
  fill: chartTheme.colors.typographyActive,
  fontSize: chartTheme.fontSize.sm,
  fontFamily: chartTheme.fontFamily,
}

const axisLine = { stroke: chartTheme.colors.tertiary }

export default function Chart({
  title,
  data,
  series,
  axis,
  type = 'line',
}: ChartProps) {
  const { Chart: ChartComponent, Series } = chartMap[type]

  return (
    <section className={styles.chart}>
      <Typography
        variant="title-sm"
        color="active"
        weight="bold"
        classname={styles.title}
      >
        {title}
      </Typography>
      <div className={styles.canvas}>
        <ChartComponent
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '70vh',
            aspectRatio: 1.618,
          }}
          responsive
          data={data}
          margin={{
            top: 8,
            right: 8,
            left: 0,
            bottom: 0,
          }}
        >
          {type !== 'pie' ? (
            <CartesianGrid
              stroke={chartTheme.colors.grid}
              strokeDasharray="4 4"
              vertical={false}
            />
          ) : null}
          {axis.x.show ? (
            <XAxis
              dataKey={axis.x.key}
              tick={axisTick}
              axisLine={axisLine}
              tickLine={axisLine}
            />
          ) : null}
          {axis.y?.show ? (
            <YAxis
              width="auto"
              tick={axisTick}
              axisLine={axisLine}
              tickLine={axisLine}
              tickFormatter={(value: number) =>
                value.toLocaleString('pt-BR', {
                  notation: 'compact',
                  compactDisplay: 'short',
                })
              }
            />
          ) : null}
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{
              fontFamily: chartTheme.fontFamily,
              fontSize: chartTheme.fontSize.md,
              color: chartTheme.colors.typographyActive,
              paddingTop: 12,
            }}
            iconType="circle"
          />
          {type === 'pie' ? (
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="78%"
              cornerRadius={chartTheme.radius.pie}
              paddingAngle={2}
              stroke={chartTheme.colors.white}
              strokeWidth={2}
            >
              {data.map((entry, index) => {
                const fill =
                  'fill' in entry && typeof entry.fill === 'string'
                    ? entry.fill
                    : chartTheme.colors.tertiaryAction
                return <Cell key={`cell-${index}`} fill={fill} />
              })}
            </Pie>
          ) : (
            series?.map((s) => (
              <Series
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color ?? chartTheme.colors.primary}
                fill={s.color ?? chartTheme.colors.primary}
                strokeWidth={type === 'line' ? 2.5 : 1}
                dot={
                  type === 'line'
                    ? {
                        r: 4,
                        fill: s.color ?? chartTheme.colors.primary,
                        stroke: chartTheme.colors.white,
                        strokeWidth: 2,
                      }
                    : false
                }
                activeDot={
                  type === 'line'
                    ? {
                        r: 5,
                        fill: s.color ?? chartTheme.colors.primary,
                        stroke: chartTheme.colors.white,
                        strokeWidth: 2,
                      }
                    : undefined
                }
                radius={
                  type === 'bar'
                    ? [chartTheme.radius.bar, chartTheme.radius.bar, 0, 0]
                    : undefined
                }
                fillOpacity={type === 'area' ? 0.2 : 1}
              />
            ))
          )}
          <RechartsDevtools />
        </ChartComponent>
      </div>
    </section>
  )
}
