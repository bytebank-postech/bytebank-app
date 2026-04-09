import { Meta, StoryObj } from '@storybook/nextjs-vite'
import Typography from './Typography'

const meta = {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

export const Heading1: Story = {
  args: {
    variant: 'title-lg',
    children: 'Heading 1',
  },
}

export const Heading2: Story = {
  args: {
    variant: 'title',
    children: 'Heading 2',
  },
}

export const Heading3: Story = {
  args: {
    variant: 'title-sm',
    children: 'Heading 3',
  },
}

export const BodyLarge: Story = {
  args: {
    variant: 'body-lg',
    children: 'Body text large',
  },
}

export const Body: Story = {
  args: {
    variant: 'body',
    children: 'Body text',
  },
}

export const BodySmall: Story = {
  args: {
    variant: 'body-sm',
    children: 'Body text small',
  },
}
