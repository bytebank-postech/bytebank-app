import { Typography } from '@/components'
import style from './MenuItem.module.scss'

export default function MenuItem({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <li className={style['menu-item']}>
      <a href="#">
        <Typography>{children}</Typography>
      </a>
    </li>
  )
}
