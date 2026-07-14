import type { Meta, StoryObj } from '@storybook/react-webpack5'
import Text from './Text'

const meta = {
  title: 'UI/Text',
  component: Text,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    children: 'Texto de exemplo do ByteBank',
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Paragraph: Story = {}

export const Heading: Story = {
  args: {
    size: 'h2',
    weight: 'bold',
    children: 'Resumo da conta',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Transa\u00e7\u00e3o conclu\u00edda com sucesso',
  },
}
