import Action from '@/components/ui/action/action'
import Input from '@/components/transactions/inputs/input'
import Menu from '@/components/layout/menu/menu'
import { Button, Select, Typography } from '@/components/ui'
export default function Home() {
  return (
    <main>
      <Typography variant="title-lg">Home</Typography>
      <div>
        <Typography variant="title">Botões</Typography>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Button variant="default">Concluir transação</Button>
          <Button variant="secondary">Concluir transação</Button>
          <Button variant="ghost">Concluir transação</Button>
          <Button variant="outline">Concluir transação</Button>
        </div>
        <Typography variant="title">Ações</Typography>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Action action="edit"></Action>
          <Action action="delete"></Action>
          <Action action="more"></Action>
        </div>
        <Typography variant="title">Inputs</Typography>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Input
            inputType="select"
            placeholder="Selecione o tipo de transação"
          ></Input>
          <Select
            placeholder="Selecione o tipo de transação"
            options={[
              { value: '01', label: 'Câmbio de Moeda' },
              { value: '02', label: 'DOC/TED' },
              { value: '03', label: 'Empréstimo e Financiamento' },
            ]}
          ></Select>
        </div>
        <Typography variant="title">Menu</Typography>
        <Menu></Menu>
      </div>
    </main>
  )
}
