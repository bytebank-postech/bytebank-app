import { Meta, StoryObj } from '@storybook/react-webpack5'
import Datepicker from './Datepicker'

const meta = {
  title: 'UI/Datepicker',
  component: Datepicker,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    inline: {
      control: 'boolean',
      description: 'Se o datepicker deve ser inline',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Datepicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'datepicker',
    label: 'Data:',
    onChange: (e) => {
      alert([e.target.value, e.target.id])
    },
  },
}
