import { Avatar, Typography } from '@/components'
import style from './Header.module.scss'

export default function Header() {
  return (
    <header className={style.header}>
      <div className={style.content}>
        <Typography>Joana da Silva Oliveira</Typography>
        <Avatar></Avatar>
      </div>
    </header>
  )
}
