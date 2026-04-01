import './input.scss'
type inputProps = {
  placeholder: string
  inputType: string
}

export default function Input({
  placeholder,
  inputType,
}: Readonly<inputProps>) {
  return <input type={inputType} placeholder={placeholder}></input>
}
