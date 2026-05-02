import { InputHTMLAttributes, DetailedHTMLProps } from 'react'

export type InputProps = {
  paddingSize?: 'medium' | 'large'
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  fullWidth?: boolean
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
