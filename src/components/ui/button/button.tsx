import './button.scss'
type buttonProps = {
  children: string
  btnClass: string
}
export default function Button({ children, btnClass }: Readonly<buttonProps>) {
  return <button className={`button ${btnClass}`}>{children}</button>
}
