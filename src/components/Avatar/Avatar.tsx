import style from './Avatar.module.scss'
import { FaRegUser } from 'react-icons/fa6'

export default function Avatar() {
  return (
    <div className={style['avatar']}>
      <FaRegUser size={24} />
    </div>
  )
}
