import { Meta, StoryObj } from '@storybook/nextjs-vite'
import Select from './Select'

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    options: {
      description: 'Array of options available in the select',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether select is disabled',
    },
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const defaultOptions = [
  { label: 'Opção 1', value: 'opt1' },
  { label: 'Opção 2', value: 'opt2' },
  { label: 'Opção 3', value: 'opt3' },
  { label: 'Opção 4', value: 'opt4' },
]

export const Default: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Selecione uma opção...',
  },
}

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Selecione uma opção...',
    disabled: true,
  },
}

export const Categories: Story = {
  args: {
    options: [
      { label: 'Transferência', value: 'transfer' },
      { label: 'Pagamento', value: 'payment' },
      { label: 'Depósito', value: 'deposit' },
      { label: 'Saque', value: 'withdrawal' },
    ],
    placeholder: 'Selecione a categoria...',
  },
}

export const AccountTypes: Story = {
  args: {
    options: [
      { label: 'Conta Corrente', value: 'checking' },
      { label: 'Conta Poupança', value: 'savings' },
      { label: 'Conta Investimento', value: 'investment' },
    ],
    placeholder: 'Tipo de conta...',
  },
}
