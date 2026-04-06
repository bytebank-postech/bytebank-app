type Option = {
  label: string
  value: string
}

type SelectProps = {
  options: Option[]
  value?: string
  placeholder?: string
  name?: string
}

export default function Select({
  options,
  value,
  placeholder = 'Selecione...',
  name,
}: SelectProps) {
  return (
    <select name={name} value={value} className="border rounded px-3 py-2">
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
