import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import FullScreenDiv from './FullScreenDiv'

const meta = {
  title: 'Layout/FullScreenDiv',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Componente que ocupa toda a tela, exceto a altura do Header.',
      },
    },
  },
  component: FullScreenDiv,
  tags: ['autodocs'],
} satisfies Meta<typeof FullScreenDiv>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Conteúdo do FullScreenDiv',
  },
}
