import { IoClose } from 'react-icons/io5'
import styles from './Modal.modules.scss'

export default function Modal({
  children,
  onClose,
}: Readonly<{ children: React.ReactNode; onClose: () => void }>) {
  return (
    <dialog>
      <button type="button" className={styles.close} onClick={onClose}>
        <IoClose />
      </button>
      {children}
    </dialog>
  )
}
