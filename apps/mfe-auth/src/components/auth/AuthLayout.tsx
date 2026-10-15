import type { ReactNode } from 'react'
import { Typography } from '@bytebank/ui'
import styles from './AuthLayout.module.scss'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden>
            B
          </span>
          <span className={styles.brandName}>Bytebank</span>
        </div>

        <section className={styles.card}>
          <div className={styles.header}>
            <Typography variant="title-lg" classname={styles.title}>
              {title}
            </Typography>
            <Typography variant="body" classname={styles.subtitle}>
              {subtitle}
            </Typography>
          </div>

          {children}
        </section>

        <div className={styles.footer}>{footer}</div>
      </div>
    </main>
  )
}
