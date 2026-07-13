'use client'

import { useEffect, useState } from 'react'
import { Typography } from '../../ui'
import Avatar from '../../Avatar/Avatar'
import style from './Header.module.scss'

type AuthUser = {
  name: string
}

export default function Header() {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/auth/api/session', { cache: 'no-store' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.user?.name === 'string') {
          setUser(data.user)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    setUser(null)

    try {
      await fetch('/auth/api/logout', {
        method: 'POST',
        cache: 'no-store',
      })
    } finally {
      window.location.assign('/auth')
    }
  }

  return (
    <header className={style.header}>
      <div className={style.content}>
        {user ? (
          <>
            <Typography color="white">{user.name}</Typography>
            <Avatar />
            <button
              type="button"
              className={style.logoutButton}
              onClick={() => void handleLogout()}
            >
              Sair
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}
