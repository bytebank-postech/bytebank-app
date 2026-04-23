import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import MenuItem from './MenuItem'

const meta = {
  title: 'Layout/MenuItem',
  component: MenuItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Menu item active',
    },
    children: {
      control: 'text',
      description: 'Menu item label',
    },
    href: {
      control: 'text',
      description: 'Link destino',
    },
  },
} satisfies Meta<typeof MenuItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Início',
    active: true,
    href: '/',
  },
}

export const Transfers: Story = {
  args: {
    children: 'Transações',
    active: false,
    href: '/transactions',
  },
}

export const Investments: Story = {
  args: {
    children: 'Investimentos',
    active: false,
    href: '/investimentos',
  },
}

export const OtherServices: Story = {
  args: {
    children: 'Outros serviços',
    active: false,
    href: '/outros-servicos',
  },
}
