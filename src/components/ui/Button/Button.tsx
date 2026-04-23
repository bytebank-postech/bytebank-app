import { getClassnames } from '@/utils'
import styles from './Button.module.scss'
import { ButtonProps } from './Button.types'
import Typography from '../Typography/Typography'
import { useMemo } from 'react'

export default function Button({
  size = 'medium',
  variant = 'default',
  fullWidth,
  disabled,
  className,
  children,
  icon,
  ...props
}: ButtonProps) {
  const classnames = getClassnames(
    styles.button,
    className,
    size && styles[size],
    variant && styles[variant],
    fullWidth && styles.fullwidth,
    disabled && styles.disabled
  )

  const content = useMemo(() => {
    if (variant === 'rounded' || variant === 'rounded-outline') {
      return icon
    }

    return typeof children === 'string' ? (
      <Typography>{children}</Typography>
    ) : (
      children
    )
  }, [variant, icon, children])

  return (
    <button {...props} disabled={disabled} className={classnames}>
      {content}
    </button>
  )
}
