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
      description: 'Array de opções do select',
    },
    placeholder: {
      control: 'text',
      description: 'Texto do placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Se o select está desabilitado',
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
      { label: 'Transferência', value: 'transferencia' },
      { label: 'Pagamento', value: 'pagamento' },
      { label: 'Depósito', value: 'deposito' },
      { label: 'Saque', value: 'saque' },
    ],
    placeholder: 'Selecione a categoria...',
  },
}

export const AccountTypes: Story = {
  args: {
    options: [
      { label: 'Conta Corrente', value: 'conta_corrente' },
      { label: 'Conta Poupança', value: 'conta_poupanca' },
      { label: 'Conta Investimento', value: 'conta_investimento' },
    ],
    placeholder: 'Tipo de conta...',
  },
}
