'use client'
import Action from '@/components/ui/action/action'
import Input from '@/components/transactions/inputs/input'
import Select from '@/components/transactions/inputs/select'
import Menu from '@/components/layout/menu/menu'
import { Button } from '@/components/ui'
import Modal from '@/components/ui/modal/modal'
import Text from '@/components/ui/text/text'
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
      <Text size="h1" variant="default" weight="bold">
        Home
      </Text>
      <div>
        <Text size="h2" variant="default" weight="bold">
          Botões
        </Text>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Button variant="default">Concluir transação</Button>
          <Button variant="secondary">Concluir transação</Button>
          <Button variant="ghost">Concluir transação</Button>
          <Button variant="outline">Concluir transação</Button>
        </div>
        <Text size="h2" variant="default" weight="bold">
          Ações
        </Text>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Action action="edit"></Action>
          <Action action="delete"></Action>
          <Action action="more"></Action>
        </div>
        <Text size="h2" variant="default" weight="bold">
          Inputs
        </Text>
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
        <Text size="h2" variant="default" weight="bold">
          Menu
        </Text>
        <Menu></Menu>
        <Text size="h2" variant="default" weight="bold">
          Modal
        </Text>
        <Button variant="default" onClick={openDialog}>
          Abrir modal
        </Button>
        <Modal onClose={closeDialog}>
          <Text size="h2" variant="default" weight="bold">
            Modal
          </Text>
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
        <Text size="h2" variant="default" weight="bold">
          Text
        </Text>
        <Text size="p" variant="default">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem optio
          iure inventore quis, recusandae natus a autem culpa! Eos molestias
          ipsum error vel ratione ab saepe, nostrum molestiae architecto cum?
        </Text>
      </div>
    </main>
  )
}
