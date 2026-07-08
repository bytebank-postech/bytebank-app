type Props = {
  params: { id: string }
}

export default function TransactionDetails({ params }: Props) {
  return (
    <main>
      <h1>Detalhes da transação {params.id}</h1>
    </main>
  )
}
