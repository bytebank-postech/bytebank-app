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
    children: {
      control: 'text',
      description: 'Menu item label',
    },
  },
} satisfies Meta<typeof MenuItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Início',
  },
}

export const Transfers: Story = {
  args: {
    children: 'Transferências',
  },
}

export const Investments: Story = {
  args: {
    children: 'Investimentos',
  },
}

export const OtherServices: Story = {
  args: {
    children: 'Outros serviços',
  },
}
