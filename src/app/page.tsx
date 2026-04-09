'use client'
import Action from '@/components/ui/action/action'
import Input from '@/components/transactions/inputs/input'
import Select from '@/components/transactions/inputs/select'
import Menu from '@/components/layout/menu/menu'
import { Button } from '@/components/ui'
import Modal from '@/components/ui/modal/modal'
function openDialog() {
  const dialog = document.querySelector('dialog')
  dialog?.showModal()
}
function closeDialog() {
  const dialog = document.querySelector('dialog')
  dialog?.close()
}
export default function Home() {
  return (
    <main>
      <h1>Home</h1>
      <div>
        <h2>Botões</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Button variant="default">Concluir transação</Button>
          <Button variant="secondary">Concluir transação</Button>
          <Button variant="ghost">Concluir transação</Button>
          <Button variant="outline">Concluir transação</Button>
        </div>
        <h2>Ações</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Action action="edit"></Action>
          <Action action="delete"></Action>
          <Action action="more"></Action>
        </div>
        <h2>Inputs</h2>
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
        <h2>Menu</h2>
        <Menu></Menu>
        <h2>Modal</h2>
        <Button variant="default" onClick={openDialog}>
          Abrir modal
        </Button>
        <Modal onClose={closeDialog}>
          <h2>Modal</h2>
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
        </Modal>
      </div>
    </main>
  )
}
