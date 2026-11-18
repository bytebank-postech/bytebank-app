'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type EditTransactionModal from '@bytebank/ui/edit-transaction-modal'

type EditTransactionModalProps = ComponentProps<typeof EditTransactionModal>

const LazyEditTransactionModal = dynamic<EditTransactionModalProps>(
  () => import('@bytebank/ui/edit-transaction-modal'),
  { ssr: false }
)

export default LazyEditTransactionModal
