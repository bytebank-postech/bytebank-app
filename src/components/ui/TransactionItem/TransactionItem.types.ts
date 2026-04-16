export type TransactionItemProps = {
  type: 'Depósito' | 'Transferência' | 'Pix' | 'Pagamento'
  name: string
  amount: number
  date: string
}
