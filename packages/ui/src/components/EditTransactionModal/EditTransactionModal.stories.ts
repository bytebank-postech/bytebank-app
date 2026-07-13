import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import EditTransactionModal from './EditTransactionModal'

const meta = {
  title: 'Transactions/EditTransactionModal',
  component: EditTransactionModal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: () => undefined,
    onSubmit: async () => undefined,
  },
} satisfies Meta<typeof EditTransactionModal>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {}

export const Edit: Story = {
  args: {
    initial: {
      id: 'transaction-1',
      type: 'Pagamento',
      name: 'Conta de luz',
      amount: -158.9,
      category: 'Moradia',
      attachments: [
        {
          id: 'attachment-1',
          name: 'fatura.pdf',
          mimeType: 'application/pdf',
          size: 12_000,
          url: '#attachment-1',
        },
      ],
    },
    onRemoveAttachment: async () => undefined,
  },
}
