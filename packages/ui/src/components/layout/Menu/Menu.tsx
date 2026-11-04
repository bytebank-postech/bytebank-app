import MenuItem from '../MenuItem/MenuItem'
import style from './Menu.module.scss'

export default function Menu({
  currentPath,
  onTransactionsIntent,
}: {
  currentPath: string
  onTransactionsIntent?: () => void
}) {
  return (
    <nav className={style.menu}>
      <ul className={style.list}>
        <MenuItem href="/" active={currentPath === '/'}>
          Início
        </MenuItem>
        <MenuItem
          href="/transactions"
          active={currentPath === '/transactions'}
          prefetchDocument={currentPath === '/'}
          onIntent={onTransactionsIntent}
        >
          Transações
        </MenuItem>
      </ul>
    </nav>
  )
}
