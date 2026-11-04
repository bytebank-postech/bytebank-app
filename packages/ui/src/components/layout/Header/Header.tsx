import { memo } from 'react'
import { Typography } from '../../ui'
import Avatar from '../../Avatar/Avatar'
import Menu from '../Menu/Menu'
import style from './Header.module.scss'

export type HeaderProps = {
  userName?: string
  onLogout?: () => void
  currentPath?: string
  onTransactionsIntent?: () => void
}

function Header({
  userName,
  onLogout,
  currentPath,
  onTransactionsIntent,
}: HeaderProps) {
  return (
    <header className={style.header}>
      <div className={style.content}>
        {currentPath ? (
          <details className={style.mobileMenu} key={currentPath}>
            <summary className={style.menuToggle}>Menu</summary>
            <div className={style.menuPanel}>
              <Menu
                currentPath={currentPath}
                onTransactionsIntent={onTransactionsIntent}
                placement="mobile"
              />
            </div>
          </details>
        ) : null}
        {userName ? (
          <>
            <Typography color="white">{userName}</Typography>
            <Avatar />
            <button
              type="button"
              className={style.logoutButton}
              onClick={onLogout}
            >
              Sair
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}

export default memo(Header)
