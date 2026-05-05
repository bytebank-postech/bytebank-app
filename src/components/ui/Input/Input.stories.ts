import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Input from './Input'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'number'],
      description: 'Tipo do input',
    },
    placeholder: {
      control: 'text',
      description: 'Texto do placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Desabilitar o input',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: {
    type: 'text',
    placeholder: 'Digite o texto...',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Digite a senha...',
  },
}

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Digite o número...',
  },
}

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'Input desabilitado',
    disabled: true,
  },
}

export const WithOnKeyDown: Story = {
  args: {
    type: 'text',
    placeholder: 'OnKeyDown no enter',
    onKeyDown: (e) => {
      if (e.key === 'Enter') {
        alert('Enter pressionado!')
      }
    },
  },
}
