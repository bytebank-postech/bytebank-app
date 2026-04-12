import { getClassnames } from '@/utils'
import styles from './TransactionItem.module.scss'
import { TransactionItemProps } from './TransactionItem.types'
import { Typography } from '../index'
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
      <div>
        <Typography variant="body-sm" color="active">
          {type}
        </Typography>
        <div>
          <Typography variant="body-lg" color="active">
            {name}
          </Typography>
          <Typography variant="body-sm" color="active">
            {date}
          </Typography>
        </div>
        <Typography
          variant="body-lg"
          color={amount < 0 ? 'error' : 'active'}
          weight="bold"
        >
          {amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Typography>
      </div>
    </div>
  )
}
