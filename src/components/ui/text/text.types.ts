import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

export type ButtonProps = {
  size?: 'medium' | 'large'
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  fullWidth?: boolean
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>
