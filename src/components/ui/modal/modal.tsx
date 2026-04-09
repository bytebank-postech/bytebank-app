'use client'
import { IoClose } from 'react-icons/io5'
import './modal.scss'

export default function Modal({
  children,
  onClose,
}: Readonly<{ children: React.ReactNode; onClose: () => void }>) {
  return (
    <dialog>
      <button type="button" className="close" onClick={onClose}>
        <IoClose />
      </button>
      {children}
    </dialog>
  )
}
