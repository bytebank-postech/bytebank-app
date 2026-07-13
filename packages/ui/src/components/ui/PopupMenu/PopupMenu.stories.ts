import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import PopupMenu from './PopupMenu'

const meta = {
  title: 'UI/PopupMenu',
  component: PopupMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    items: [
      { id: 'edit', label: 'Editar transa\u00e7\u00e3o', onClick: () => undefined },
      { id: 'remove', label: 'Excluir transa\u00e7\u00e3o', onClick: () => undefined },
    ],
  },
} satisfies Meta<typeof PopupMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LeftAligned: Story = {
  args: { align: 'left' },
}
