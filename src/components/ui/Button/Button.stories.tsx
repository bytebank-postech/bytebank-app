import { Meta, StoryObj } from '@storybook/nextjs-vite'
import Button from './Button'
import { MdEdit } from 'react-icons/md'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['medium', 'large'],
      description: 'Tamanho do botão',
    },
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'ghost',
        'outline',
        'rounded',
        'rounded-outline',
      ],
      description: 'Estilo do botão',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Se o botão ocupa a largura completa',
    },
    disabled: {
      control: 'boolean',
      description: 'Se o botão está desabilitado',
    },
    children: {
      description: 'Conteúdo do botão',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Botão default',
    size: 'medium',
  },
}

export const Large: Story = {
  args: {
    children: 'Botão large',
    size: 'large',
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Botão de largura completa',
    fullWidth: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Botão desabilitado',
    disabled: true,
  },
}

export const DefaultWithReactNode: Story = {
  args: {
    children: (
      <span>
        Botão default com <strong>ReactNode</strong>
      </span>
    ),
    variant: 'default',
  },
}

export const Rounded: Story = {
  args: {
    variant: 'rounded',
    icon: <MdEdit size={20} />,
  },
}
