import { getClassnames } from '@/utils'
import styles from './Input.module.scss'
import { InputProps } from './Input.types'
// import '../input.scss'

export default function Input({
  size = 'medium',
  variant = 'default',
  fullWidth,
  disabled,
  children,
  ...props
}: InputProps) {
  const classnames = getClassnames(
    styles.input,
    size && styles[size],
    variant && styles[variant],
    fullWidth && styles.fullwidth,
    disabled && styles.disabled
  )
  return <input className={classnames} {...props}></input>
}
