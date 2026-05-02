import Link from 'next/link'
import { Typography } from '@/components'
import style from './MenuItem.module.scss'

export default function MenuItem({
  children,
  active = false,
  href,
}: Readonly<{
  active?: boolean
  children: React.ReactNode
  href: string
}>) {
  return (
    <li className={style['menu-item']}>
      <Link href={href} className={style.link}>
        <Typography color="active" variant={active ? 'body-bold' : 'body'}>
          {children}
        </Typography>
      </Link>
    </li>
  )
}
