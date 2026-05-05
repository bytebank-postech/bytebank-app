import { Meta, StoryObj } from '@storybook/nextjs-vite'
import TransactionItem from './TransactionItem'

const meta = {
  title: 'UI/TransactionItem',
  component: TransactionItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TransactionItem>

export default meta
type Story = StoryObj<typeof meta>

export const Income: Story = {
  args: {
    type: 'Depósito',
    name: 'Salário',
    amount: 5000,
    date: '2026-01-01',
  },
}

export const Outcome: Story = {
  args: {
    type: 'Pagamento',
    name: 'Padaria',
    amount: -35,
    date: '2026-01-01',
  },
}
