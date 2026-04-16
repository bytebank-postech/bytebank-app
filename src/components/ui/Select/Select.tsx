import styles from './Select.module.scss'
import { SelectProps } from './Select.types'

export default function Select({
  options,
  placeholder = 'Selecione uma opção...',
  disabled = false,
  ...props
}: SelectProps) {
  return (
    <select className={styles.select} disabled={disabled} {...props}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
