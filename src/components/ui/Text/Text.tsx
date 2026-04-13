import { getClassnames } from '@/utils'
import styles from './Text.module.scss'
import { TextProps } from './Text.types'

export default function Text({
  size = 'p',
  variant = 'default',
  weight = 'normal',
  children,
  ...props
}: Readonly<TextProps>) {
  const classnames = getClassnames(
    styles.text,
    size && styles[size],
    variant && styles[variant],
    weight && styles[weight]
  )

  return size === 'h1' ? (
    <h1 className={classnames} {...props}>
      {children}
    </h1>
  ) : size === 'h2' ? (
    <h2 className={classnames} {...props}>
      {children}
    </h2>
  ) : size === 'h3' ? (
    <h3 className={classnames} {...props}>
      {children}
    </h3>
  ) : size === 'h4' ? (
    <h4 className={classnames} {...props}>
      {children}
    </h4>
  ) : size === 'h5' ? (
    <h5 className={classnames} {...props}>
      {children}
    </h5>
  ) : size === 'h6' ? (
    <h6 className={classnames} {...props}>
      {children}
    </h6>
  ) : (
    <p {...props}>{children}</p>
  )
}
