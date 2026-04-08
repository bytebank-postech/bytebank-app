import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import Button from './Button'

const meta = {
  title: 'ui/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const ButtonDefault: Story = {
  args: {
    children: 'Teste',
    onClick: () => alert('Botão clicado'),
  },
}
