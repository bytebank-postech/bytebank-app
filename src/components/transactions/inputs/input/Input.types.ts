import { InputHTMLAttributes, DetailedHTMLProps } from 'react'

export type InputProps = {
  size?: 'medium' | 'large'
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  fullWidth?: boolean
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
