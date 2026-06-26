import { Meta, StoryObj } from '@storybook/nextjs-vite'

import Pagination from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onPageChange: {
      action: 'page changed',
    },
  },
}

export default meta

type Story = StoryObj<typeof Pagination>

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalItems: 237,
    pageSize: 10,
  },
}

export const LastPage: Story = {
  args: {
    currentPage: 24,
    totalItems: 237,
    pageSize: 10,
  },
}

export const Disabled: Story = {
  args: {
    currentPage: 8,
    totalItems: 237,
    pageSize: 10,
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    currentPage: 8,
    totalItems: 237,
    pageSize: 10,
    loading: true,
  },
}

export const ManyPages: Story = {
  args: {
    currentPage: 54,
    totalItems: 10000,
    pageSize: 10,
    siblingCount: 2,
    boundaryCount: 2,
  },
}

export const Simple: Story = {
  args: {
    currentPage: 4,
    totalItems: 120,
    pageSize: 10,
    showFirstLast: false,
  },
}
