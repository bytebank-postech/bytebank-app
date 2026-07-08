import { Meta, StoryObj } from '@storybook/nextjs-vite'
import Modal from './Modal'

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClose: {
      description: 'Função chamada ao fechar o modal',
      action: 'fechado',
    },
    children: {
      description: 'Conteúdo do modal',
    },
  },
  decorators: [
    (Story) => (
      <div>
        <button onClick={() => document.querySelector('dialog')?.showModal()}>
          Abrir Modal
        </button>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Padrão: Story = {
  args: {
    children: (
      <div>
        <h2>Título do Modal</h2>
        <p>
          Este é o conteúdo do modal. Você pode adicionar qualquer elemento
          aqui.
        </p>
      </div>
    ),
    onClose: () => alert('Modal fechado'),
  },
}

export const ComFormulário: Story = {
  args: {
    children: (
      <div>
        <h2>Preencher Informações</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            Nome:
            <input type="text" placeholder="Digite seu nome" />
          </label>
          <label>
            Email:
            <input type="email" placeholder="Digite seu email" />
          </label>
          <button type="submit">Enviar</button>
        </form>
      </div>
    ),
    onClose: () => console.log('Modal com formulário fechado'),
  },
}

export const ComConteúdoLongo: Story = {
  args: {
    children: (
      <div>
        <h2>Termos e Condições</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
      </div>
    ),
    onClose: () => console.log('Modal com conteúdo longo fechado'),
  },
}
