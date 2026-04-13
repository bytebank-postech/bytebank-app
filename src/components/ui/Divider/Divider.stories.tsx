import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Divider from './Divider'

const meta = {
  title: 'UI/Divisor',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        style={{
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  args: {
    orientacao: 'horizontal',
    color: 'primary',
  },
}

export const Vertical: Story = {
  args: {
    orientacao: 'vertical',
    color: 'primary',
  },
}

export const Cores: Story = {
  args: {
    orientacao: 'horizontal',
    color: 'secondary',
  },
}

export const Espessuras: Story = {
  args: {
    orientacao: 'horizontal',
    color: 'primary',
    espessura: 'grosso',
  },
}
