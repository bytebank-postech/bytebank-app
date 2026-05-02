import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Paper from './Paper'

const meta: Meta<typeof Paper> = {
  title: 'UI/Paper',
  component: Paper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Padrão: Story = {
  args: {
    children: 'Conteúdo do Paper',
  },
}

export const Cores: Story = {
  args: {
    children: 'Paper com cor primária',
    color: 'primary',
  },
}
