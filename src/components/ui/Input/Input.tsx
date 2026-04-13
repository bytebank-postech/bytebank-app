import { getClassnames } from '@/utils'
import styles from './Input.module.scss'
import { InputProps } from './Input.types'

export default function Input({
  paddingSize = 'medium',
  variant = 'default',
  fullWidth,
  disabled,
  ...props
}: InputProps) {
  const classnames = getClassnames(
    styles.input,
    paddingSize && styles[paddingSize],
    variant && styles[variant],
    fullWidth && styles.fullwidth,
    disabled && styles.disabled
  )

  return <input className={classnames} disabled={disabled} {...props} />
}
