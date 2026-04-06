import './menu.scss'
import MenuItem from './menuItem'
export default function Menu() {
  return (
    <nav className="menu">
      <ul>
        <MenuItem>Início</MenuItem>
        <MenuItem>Transferências</MenuItem>
        <MenuItem>Investimentos</MenuItem>
        <MenuItem>Outros serviços</MenuItem>
      </ul>
    </nav>
  )
}
