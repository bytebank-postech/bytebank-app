import { getClassnames } from '@/utils'
import { ElementType } from 'react'
import style from './Typography.module.scss'
import { TypographyProps, Variant } from './Typography.types'

const componentMap: Record<Variant, ElementType> = {
  body: 'span',
  'body-bold': 'strong',
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
  weight = 'normal',
  color,
}: TypographyProps) {
  const Component = componentMap[variant]
  const classnames = getClassnames(
    classname,
    style[variant ?? 'body'],
    color && style[`${color}Color`],
    style[weight]
  )

  return <Component className={classnames}>{children}</Component>
}
