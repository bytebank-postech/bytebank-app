'use client'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { RechartsDevtools } from '@recharts/devtools'
import { ChartProps } from './Chart.types'
import { chartMap } from './Chart.config'
export default function Chart({
  data,
  series,
  axis,
  type = 'line',
}: ChartProps) {
  const { Chart: ChartComponent, Series } = chartMap[type]
  return (
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
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      {type !== 'pie' ? <CartesianGrid strokeDasharray="5 5" /> : null}
      {axis.x.show ? <XAxis dataKey={axis.x.key} /> : null}
      {axis.y?.show ? <YAxis width="auto" /> : null}
      <Tooltip />
      <Legend />
      {series?.map((s) => (
        <Series
          key={s.key}
          type="monotone"
          dataKey={s.key}
          stroke={s.color}
          fill={s.color}
        />
      ))}
      <RechartsDevtools />
    </ChartComponent>
  )
}
