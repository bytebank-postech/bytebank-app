import { getClassnames } from '@/utils'
import styles from './Button.module.scss'
import { ButtonProps } from './Button.types'
import Typography from '../Typography/Typography'

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
      {typeof children === 'string' ? (
        <Typography>{children}</Typography>
      ) : (
        children
      )}
    </button>
  )
}
