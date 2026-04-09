import { Meta, StoryObj } from '@storybook/nextjs-vite'
import Button from './Button'

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
      description: 'Button size variant',
    },
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'ghost', 'outline'],
      description: 'Button style variant',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether button takes full width',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether button is disabled',
    },
    children: {
      description: 'Button text content',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Click me',
    size: 'medium',
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'large',
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

export const DisabledSecondary: Story = {
  args: {
    children: 'Disabled Secondary',
    variant: 'secondary',
    disabled: true,
  },
}

export const DefaultWithReactNode: Story = {
  args: {
    children: (
      <span>
        Default with <strong>ReactNode</strong>
      </span>
    ),
    variant: 'default',
  },
}
