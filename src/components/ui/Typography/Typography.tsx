import { getClassnames } from '@/utils'
import { ElementType } from 'react'
import style from './Typography.module.scss'

type Variant =
  | 'body'
  | 'body-sm'
  | 'body-lg'
  | 'title'
  | 'title-lg'
  | 'title-sm'

type TypographyProps = {
  as?: ElementType
  children: React.ReactNode
  classname?: string
  variant?: Variant
}

const componentMap: Record<Variant, ElementType> = {
  body: 'span',
  'body-sm': 'span',
  'body-lg': 'span',
  'title-lg': 'h1',
  title: 'h2',
  'title-sm': 'h3',
}

export default function Typography({
  children,
  classname,
  variant = 'body',
}: TypographyProps) {
  const Component = componentMap[variant]
  const classnames = getClassnames(classname, style[variant ?? 'body'])

  return <Component className={classnames}>{children}</Component>
}
