import { IoClose } from 'react-icons/io5'
import styles from './Modal.module.scss'
import { ModalProps } from './Modal.types'

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <dialog className={styles.dialog}>
      <button type="button" className={styles.close} onClick={onClose}>
        <IoClose />
      </button>
      {children}
    </dialog>
  )
}
