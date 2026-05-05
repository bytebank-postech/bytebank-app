import { getClassnames } from '@/utils'
import styles from './Paper.module.scss'
import { PaperProps } from './Paper.types'

export default function Paper({
  children,
  classname,
  color = 'white',
}: PaperProps) {
  const classNames = getClassnames(
    styles.paper,
    classname,
    styles[`bg-${color}`]
  )

  return <div className={classNames}>{children}</div>
}
