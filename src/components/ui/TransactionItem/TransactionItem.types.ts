export type TransactionItemProps = {
  type: 'Depósito' | 'Transferência' | 'Pix' | 'Pagamento'
  name?: string
  amount: number
  date: string
  menuItems?: { id: string; label: string; onClick: () => void }[]
  menuPlacement?: 'under-date' | 'inline-right' | 'home-stacked-date'
  selectable?: boolean
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
}
