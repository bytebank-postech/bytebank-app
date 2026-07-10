import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Avatar from './Avatar'

const meta = {
  title: 'Layout/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
