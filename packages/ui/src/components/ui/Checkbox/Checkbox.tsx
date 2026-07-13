import { getClassnames } from '@bytebank/shared'
import styles from './Checkbox.module.scss'
import { CheckboxProps } from './Checkbox.types'

export default function Checkbox({
  type,
  label,
  value,
  name,
  id,
  onChange,
  disabled,
  fullWidth,
}: CheckboxProps) {
  const classnames = getClassnames(
    styles.checkbox,
    fullWidth && styles.fullwidth,
    disabled && styles.disabled
  )

  return (
    <div className={classnames}>
      <label className={styles.label}>
        <input
          type={type}
          name={name}
          disabled={disabled}
          value={value}
          onChange={() => onChange?.(value)}
          id={id}
          className={styles.input}
        ></input>
        {label}
      </label>
    </div>
  )
}
