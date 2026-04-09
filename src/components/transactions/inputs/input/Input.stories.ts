import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import Input from './input'

const meta = {
  title: 'transactions/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const InputDefault: Story = {
  args: {
    value: 'Teste',
    // onChange: () => alert('Valor alterado!'),
  },
}
