'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { TbDotsVertical } from 'react-icons/tb'
import styles from './PopupMenu.module.scss'
import { getClassnames } from '@/utils'

export type PopupMenuItem = {
  id: string
  label: string
  onClick: () => void
}

export type PopupMenuProps = {
  items: PopupMenuItem[]
  align?: 'left' | 'right'
  trigger?: 'kebab' | 'button'
  classname?: string
}

export default function PopupMenu({
  items,
  align = 'right',
  trigger = 'kebab',
  classname,
}: PopupMenuProps) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!open) return
      const root = rootRef.current
      if (!root) return
      if (e.target instanceof Node && root.contains(e.target)) return
      setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const menuClass = getClassnames(
    styles.menu,
    align === 'left' ? styles.left : styles.right
  )

  return (
    <div ref={rootRef} className={getClassnames(styles.root, classname)}>
      {trigger === 'kebab' ? (
        <button
          type="button"
          className={styles.kebab}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          <TbDotsVertical size={22} />
        </button>
      ) : (
        <button
          type="button"
          className={styles.kebab}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          <TbDotsVertical size={22} />
        </button>
      )}

      {open ? (
        <div id={menuId} role="menu" className={menuClass}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
