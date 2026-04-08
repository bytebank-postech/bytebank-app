import { getClassnames } from '@/utils'
import styles from './Button.module.scss'
import { ButtonProps } from './Button.types'

export default function Button({
  size = 'medium',
  variant = 'default',
  fullWidth,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classnames = getClassnames(
    styles.button,
    size && styles[size],
    variant && styles[variant],
    fullWidth && styles.fullwidth,
    disabled && styles.disabled
  )

  return (
    <button className={classnames} {...props}>
      {children}
    </button>
  )
}
