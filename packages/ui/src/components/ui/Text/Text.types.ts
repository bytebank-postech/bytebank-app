export type TextProps = {
  size?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  weight?: 'bold' | 'normal'
  variant?: 'default' | 'active' | 'secondary' | 'ghost' | 'danger' | 'success'
  children: React.ReactNode
}
