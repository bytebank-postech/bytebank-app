import styles from './FullScreenDiv.module.scss'

export default function FullScreenDiv({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={styles.fullscreen}>{children}</div>
}
