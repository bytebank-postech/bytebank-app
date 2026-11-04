'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { EditTransactionModal } from '@bytebank/ui'

type EditTransactionModalProps = ComponentProps<typeof EditTransactionModal>

const LazyEditTransactionModal = dynamic<EditTransactionModalProps>(
  () =>
    import('@bytebank/ui').then(
      (module) => module.EditTransactionModal
    ),
  { ssr: false }
)

export default LazyEditTransactionModal
