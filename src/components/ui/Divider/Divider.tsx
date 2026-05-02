import { getClassnames } from '@/utils'
import styles from './Divider.module.scss'
import { DividerProps } from './Divider.types'

export default function Divider({
  orientacao,
  espessura = 'medio',
  color = 'white',
  classname,
}: DividerProps) {
  const classNames = getClassnames(
    styles.divider,
    classname,
    styles[orientacao],
    styles[color],
    styles[espessura]
  )

  return <span className={classNames} />
}
