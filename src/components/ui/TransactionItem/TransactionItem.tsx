import { getClassnames } from '@/utils'
import styles from './TransactionItem.module.scss'
import { TransactionItemProps } from './TransactionItem.types'
import Typography from '../Typography/Typography'
import PopupMenu from '../PopupMenu/PopupMenu'

export default function TransactionItem({
  type,
  name,
  amount,
  date,
  menuItems,
  menuPlacement = 'under-date',
  selectable,
  selected,
  onSelectedChange,
}: TransactionItemProps) {
  const amountClass = getClassnames(
    styles.amount,
    amount >= 0 ? styles.amountPositive : styles.amountNegative
  )

  return (
    <div
      className={getClassnames(
        styles.transactionItem,
        selectable && styles.selectable
      )}
    >
      {selectable ? (
        <label className={styles.checkboxWrapper} aria-label="Selecionar item">
          <input
            className={styles.checkboxInput}
            type="checkbox"
            checked={!!selected}
            onChange={(e) => onSelectedChange?.(e.target.checked)}
          />
          <span className={styles.checkboxBox} aria-hidden="true" />
        </label>
      ) : null}
      <div className={styles.body}>
        <div className={styles.rowTop}>
          {menuPlacement === 'home-stacked-date' ? (
            <>
              <div className={styles.leftStack}>
                <Typography variant="body-sm" classname={styles.typeText}>
                  {type}
                </Typography>
                <Typography variant="body-sm" classname={styles.dateText}>
                  {date}
                </Typography>
              </div>
              {menuItems?.length ? (
                <PopupMenu
                  trigger="kebab"
                  align="right"
                  items={menuItems.map((i) => ({
                    id: i.id,
                    label: i.label,
                    onClick: i.onClick,
                  }))}
                />
              ) : null}
            </>
          ) : menuPlacement === 'inline-right' ? (
            <>
              <Typography variant="body-sm" classname={styles.typeText}>
                {type}
              </Typography>
              <div className={styles.inlineRight}>
                <Typography variant="body-sm" classname={styles.dateText}>
                  {date}
                </Typography>
                {menuItems?.length ? (
                  <PopupMenu
                    trigger="kebab"
                    align="right"
                    items={menuItems.map((i) => ({
                      id: i.id,
                      label: i.label,
                      onClick: i.onClick,
                    }))}
                  />
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Typography variant="body-sm" classname={styles.typeText}>
                {type}
              </Typography>
              <div className={styles.rightTop}>
                <Typography variant="body-sm" classname={styles.dateText}>
                  {date}
                </Typography>
                {menuItems?.length ? (
                  <PopupMenu
                    trigger="kebab"
                    align="right"
                    classname={styles.kebabWrapper}
                    items={menuItems.map((i) => ({
                      id: i.id,
                      label: i.label,
                      onClick: i.onClick,
                    }))}
                  />
                ) : null}
              </div>
            </>
          )}
        </div>
        {name ? (
          <Typography variant="body-sm" classname={styles.nameText}>
            {name}
          </Typography>
        ) : null}
        <span className={amountClass}>
          {amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </span>
      </div>
    </div>
  )
}
