'use client'

import { useEffect, useRef } from 'react'
import style from './MenuItem.module.scss'
import { Typography } from '../../ui'

export default function MenuItem({
  children,
  active = false,
  href,
  prefetchDocument = false,
  onIntent,
}: Readonly<{
  active?: boolean
  children: React.ReactNode
  href: string
  prefetchDocument?: boolean
  onIntent?: () => void
}>) {
  const anchorRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const anchor = anchorRef.current
    if (
      !prefetchDocument ||
      !anchor ||
      typeof IntersectionObserver === 'undefined'
    )
      return
    let hint: HTMLLinkElement | undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      hint = document.createElement('link')
      hint.rel = 'prefetch'
      hint.as = 'document'
      hint.href = anchor.href
      document.head.appendChild(hint)
      observer.disconnect()
    })
    observer.observe(anchor)
    return () => {
      observer.disconnect()
      hint?.remove()
    }
  }, [href, prefetchDocument])

  return (
    <li className={style['menu-item']}>
      <a
        ref={anchorRef}
        href={href}
        className={style.link}
        onMouseEnter={onIntent}
        onFocus={onIntent}
      >
        <Typography color="active" variant={active ? 'body-bold' : 'body'}>
          {children}
        </Typography>
      </a>
    </li>
  )
}
