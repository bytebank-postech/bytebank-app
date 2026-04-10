import { getClassnames } from '@/utils'
import styles from './TransactionItem.module.scss'
import { TransactionItemProps } from './TransactionItem.types'
export default function TransactionItem({
  type,
  name,
  amount,
  date,
}: TransactionItemProps) {
  const classNames = getClassnames(
    styles.transactionItem,
    amount > 0 ? styles.income : styles.outcome
  )
  return (
    <div className={classNames}>
      <p>{type}</p>
      <p>{name}</p>
      <p>{amount}</p>
      <p>{date}</p>
    </div>
  )
}
