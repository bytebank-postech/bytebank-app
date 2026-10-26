import { memo } from 'react'
import { Typography } from '../../ui'
import Avatar from '../../Avatar/Avatar'
import style from './Header.module.scss'

export type HeaderProps = {
  userName?: string
  onLogout?: () => void
}

function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className={style.header}>
      <div className={style.content}>
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
