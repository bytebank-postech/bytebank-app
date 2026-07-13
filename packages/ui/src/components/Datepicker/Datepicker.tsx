import { getClassnames } from '@bytebank/shared'
import styles from './Datepicker.module.scss'
import { DatepickerProps } from './Datepicker.types'
export default function Datepicker({
  paddingSize = 'medium',
  variant = 'default',
  fullWidth,
  disabled,
  className,
  inline,
  ...props
}: DatepickerProps) {
  const classNamesContainer = getClassnames(
    styles.datepicker,
    inline && styles.inline
  )
  const classnames = getClassnames(
    styles.input,
    className,
    paddingSize && styles[paddingSize],
    variant && styles[variant],
    fullWidth && styles.fullwidth,
    disabled && styles.disabled
  )
  return (
    <div className={classNamesContainer}>
      {props.label ? (
        <label htmlFor={props.id} className={styles.label}>
          {props.label}
        </label>
      ) : null}
      <input
        type="date"
        {...props}
        disabled={disabled}
        className={classnames}
      />
    </div>
  )
}
