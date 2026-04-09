import { SelectHTMLAttributes, DetailedHTMLProps } from 'react'

export type Option = {
  label: string
  value: string
}

export type SelectProps = {
  options: Option[]
  placeholder?: string
  disabled?: boolean
} & DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>
