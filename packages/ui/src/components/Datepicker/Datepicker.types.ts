import { InputHTMLAttributes, DetailedHTMLProps } from 'react'
export type DatepickerProps = {
  id?: string
  label?: string
  inline?: boolean
  paddingSize?: 'medium' | 'large'
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  fullWidth?: boolean
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
