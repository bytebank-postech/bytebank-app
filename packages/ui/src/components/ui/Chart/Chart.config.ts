import {
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  Line,
  Bar,
  Area,
  Pie,
} from 'recharts'
import { ChartConfig, ChartType } from './Chart.types'

export const chartMap = {
  line: {
    Chart: LineChart,
    Series: Line,
  },
  bar: {
    Chart: BarChart,
    Series: Bar,
  },
  area: {
    Chart: AreaChart,
    Series: Area,
  },
  pie: {
    Chart: PieChart,
    Series: Pie,
  },
} as Record<ChartType, ChartConfig>
