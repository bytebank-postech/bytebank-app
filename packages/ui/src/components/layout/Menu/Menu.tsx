import MenuItem from '../MenuItem/MenuItem'
import style from './Menu.module.scss'

export default function Menu({ currentPath }: { currentPath: string }) {
  return (
    <nav className={style.menu}>
      <ul className={style.list}>
        <MenuItem href="/" active={currentPath === '/'}>
          Início
        </MenuItem>
        <MenuItem href="/transactions" active={currentPath === '/transactions'}>
          Transações
        </MenuItem>
      </ul>
    </nav>
  )
}
