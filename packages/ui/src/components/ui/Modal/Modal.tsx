'use client'

import { IoClose } from 'react-icons/io5'
import styles from './Modal.module.scss'
import { ModalProps } from './Modal.types'
import { useEffect, useRef } from 'react'
import { getClassnames } from '@bytebank/shared'

export default function Modal({
  children,
  onClose,
  isOpen,
  classname,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      className={getClassnames(styles.dialog, classname)}
      onClose={onClose}
    >
      <button type="button" className={styles.close} onClick={onClose}>
        <IoClose />
      </button>
      {children}
    </dialog>
  )
}
