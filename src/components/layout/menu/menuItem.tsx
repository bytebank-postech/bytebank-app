import './menu.scss'
export default function MenuItem({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <li className="menu-item">
      <a href="#">{children}</a>
    </li>
  )
}
