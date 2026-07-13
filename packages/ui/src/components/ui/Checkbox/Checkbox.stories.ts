import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Checkbox from './Checkbox'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['radio', 'checkbox'],
      description: 'Tipo do input',
    },

    disabled: {
      control: 'boolean',
      description: 'Desabilitar o input',
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'teste-checkbox',
    type: 'checkbox',
    label: 'Checkbox',
    name: 'teste-checkbox1',
    value: 'teste1',
    onChange: (e) => {
      alert('Valor alterado: ' + e)
    },
  },
}
