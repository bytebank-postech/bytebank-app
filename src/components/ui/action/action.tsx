import './action.scss'
import { MdEdit, MdDelete } from 'react-icons/md'
import { TbDots } from 'react-icons/tb'
export default function Action({ action }: Readonly<{ action: string }>) {
  return (
    <button className={`action ${action}`}>
      {action === 'edit' ? (
        <MdEdit size={20} color="#fff" />
      ) : action === 'delete' ? (
        <MdDelete size={20} color="#fff" />
      ) : (
        <TbDots size={20} color="#fff" />
      )}
    </button>
  )
}
