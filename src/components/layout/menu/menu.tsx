import MenuItem from '../MenuItem/MenuItem'
import style from './Menu.module.scss'

export default function Menu() {
  return (
    <nav className={style['menu']}>
      <ul>
        <MenuItem>Início</MenuItem>
        <MenuItem>Transferências</MenuItem>
        <MenuItem>Investimentos</MenuItem>
        <MenuItem>Outros serviços</MenuItem>
      </ul>
    </nav>
  )
}
