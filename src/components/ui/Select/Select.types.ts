import { DetailedHTMLProps, HTMLAttributes } from 'react'

export type Option = {
  label: string
  value: string
}

export type SelectProps = {
  options: Option[]
  placeholder?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
} & Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'onChange'
>
