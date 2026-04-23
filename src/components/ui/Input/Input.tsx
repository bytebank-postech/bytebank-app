import { getClassnames } from '@/utils'
import styles from './Input.module.scss'
import { InputProps } from './Input.types'

export default function Input({
  paddingSize = 'medium',
  variant = 'default',
  fullWidth,
  disabled,
  className,
  ...props
}: InputProps) {
  const classnames = getClassnames(
    styles.input,
    className,
    paddingSize && styles[paddingSize],
    variant && styles[variant],
    fullWidth && styles.fullwidth,
    disabled && styles.disabled
  )

  return <input {...props} disabled={disabled} className={classnames} />
}
