import type { Meta, StoryObj } from '@storybook/react-webpack5'
import Chart from './Chart'
import { chartTheme, transactionTypeColors } from './Chart.theme'

const meta = {
  title: 'UI/Chart',
  component: Chart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chart>

export default meta
type Story = StoryObj<typeof meta>

export const Line: Story = {
  args: {
    title: 'Despesas x Receitas',
    type: 'line',
    series: [
      {
        name: 'Despesas',
        key: 'Despesas',
        color: chartTheme.series.despesas,
      },
      {
        name: 'Receitas',
        key: 'Receitas',
        color: chartTheme.series.receitas,
      },
    ],
    axis: {
      x: { key: 'name', show: true },
      y: { key: 'value', show: true },
    },
    data: [
      {
        name: 'Janeiro',
        Despesas: 4000,
        Receitas: 2400,
      },
      {
        name: 'Fevereiro',
        Despesas: 3000,
        Receitas: 1398,
      },
      {
        name: 'Março',
        Despesas: 2000,
        Receitas: 9800,
      },
      {
        name: 'Abril',
        Despesas: 2780,
        Receitas: 3908,
      },
      {
        name: 'Maio',
        Despesas: 1890,
        Receitas: 4800,
      },
      {
        name: 'Junho',
        Despesas: 2390,
        Receitas: 3800,
      },
      {
        name: 'Julho',
        Despesas: 3490,
        Receitas: 4300,
      },
    ],
  },
}

export const Bar: Story = {
  args: {
    title: 'Despesas x Receitas',
    type: 'bar',
    series: [
      {
        name: 'Despesas',
        key: 'Despesas',
        color: chartTheme.series.despesas,
      },
      {
        name: 'Receitas',
        key: 'Receitas',
        color: chartTheme.series.receitas,
      },
    ],
    axis: {
      x: { key: 'name', show: true },
      y: { key: 'value', show: true },
    },
    data: [
      {
        name: 'Janeiro',
        Despesas: 4000,
        Receitas: 2400,
      },
      {
        name: 'Fevereiro',
        Despesas: 3000,
        Receitas: 1398,
      },
      {
        name: 'Março',
        Despesas: 2000,
        Receitas: 9800,
      },
      {
        name: 'Abril',
        Despesas: 2780,
        Receitas: 3908,
      },
      {
        name: 'Maio',
        Despesas: 1890,
        Receitas: 4800,
      },
      {
        name: 'Junho',
        Despesas: 2390,
        Receitas: 3800,
      },
      {
        name: 'Julho',
        Despesas: 3490,
        Receitas: 4300,
      },
    ],
  },
}

export const Pie: Story = {
  args: {
    title: 'Despesas x Receitas',
    type: 'pie',
    series: [
      {
        name: 'Movimentações',
        key: 'value',
        // color: 'red',
      },
    ],
    axis: {
      x: { key: 'name', show: false },
      y: { key: 'value', show: false },
    },
    data: [
      {
        name: 'Pagamentos',
        value: 4000,
        fill: transactionTypeColors.Pagamento,
      },
      {
        name: 'Transferências',
        value: 2400,
        fill: transactionTypeColors.Transferência,
      },
      {
        name: 'Investimentos',
        value: 1398,
        fill: transactionTypeColors.Pix,
      },
    ],
  },
}

export const Area: Story = {
  args: {
    title: 'Despesas x Receitas',
    type: 'area',
    series: [
      {
        name: 'Despesas',
        key: 'Despesas',
        color: chartTheme.series.despesas,
      },
      {
        name: 'Receitas',
        key: 'Receitas',
        color: chartTheme.series.receitas,
      },
    ],
    axis: {
      x: { key: 'name', show: true },
      y: { key: 'value', show: true },
    },
    data: [
      {
        name: 'Janeiro',
        Despesas: 4000,
        Receitas: 2400,
      },
      {
        name: 'Fevereiro',
        Despesas: 3000,
        Receitas: 1398,
      },
      {
        name: 'Março',
        Despesas: 2000,
        Receitas: 9800,
      },
      {
        name: 'Abril',
        Despesas: 2780,
        Receitas: 3908,
      },
      {
        name: 'Maio',
        Despesas: 1890,
        Receitas: 4800,
      },
      {
        name: 'Junho',
        Despesas: 2390,
        Receitas: 3800,
      },
      {
        name: 'Julho',
        Despesas: 3490,
        Receitas: 4300,
      },
    ],
  },
}
