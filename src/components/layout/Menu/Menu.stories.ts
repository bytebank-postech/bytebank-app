import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Menu from './Menu'

const meta = {
  title: 'Layout/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
