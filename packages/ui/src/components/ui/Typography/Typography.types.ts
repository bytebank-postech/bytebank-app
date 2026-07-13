import { ElementType } from 'react'

export type Variant =
  | 'body'
  | 'body-sm'
  | 'body-lg'
  | 'body-bold'
  | 'title'
  | 'title-lg'
  | 'title-sm'

export type TypographyProps = {
  as?: ElementType
  children: React.ReactNode
  classname?: string
  variant?: Variant
  color?: 'default' | 'active' | 'white' | 'error'
  weight?: 'normal' | 'bold'
}
