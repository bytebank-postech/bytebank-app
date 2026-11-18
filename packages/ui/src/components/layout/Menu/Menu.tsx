'use client'

import { useSyncExternalStore } from 'react'
import MenuItem from '../MenuItem/MenuItem'
import style from './Menu.module.scss'

const desktopQuery = '(width > 1000px)'

function subscribe(onChange: () => void) {
  const query = window.matchMedia(desktopQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(desktopQuery).matches
}

function getServerSnapshot() {
  return null
}

export default function Menu({
  currentPath,
  onTransactionsIntent,
  placement,
}: {
  currentPath: string
  onTransactionsIntent?: () => void
  placement?: 'desktop' | 'mobile'
}) {
  const isDesktop = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  if (
    placement &&
    (isDesktop === null || (placement === 'desktop') !== isDesktop)
  ) {
    return null
  }

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
