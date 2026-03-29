# ByteBank

Aplicação de gerenciamento financeiro desenvolvida como Tech Challenge Fase 01 da Pós-Tech Front-End Engineering - FIAP.

## Tecnologias

- Next.js 16
- TypeScript
- SCSS

## Pré-requisitos

- Node.js >= 20

## Como rodar

1. Clone o repositório
   \`\`\`bash
   git clone https://github.com/bytebank-postech/bytebank-app.git
   \`\`\`

2. Instale as dependências
   \`\`\`bash
   npm install
   \`\`\`

3. Rode o projeto
   \`\`\`bash
   npm run dev
   \`\`\`

4. Acesse no navegador
   \`\`\`
   http://localhost:3000
   \`\`\`

## API

A aplicação possui uma API fake com as seguintes rotas:

| Método | Rota                   | Descrição                  |
| ------ | ---------------------- | -------------------------- |
| GET    | /api/transactions      | Lista todas as transações  |
| POST   | /api/transactions      | Cria uma nova transação    |
| GET    | /api/transactions/[id] | Busca uma transação por id |
| PUT    | /api/transactions/[id] | Edita uma transação        |
| DELETE | /api/transactions/[id] | Exclui uma transação       |

## Services

Funções prontas pra consumir a API em `src/services/transactions.ts`:

| Função                        | Tipo   | Descrição                  |
| ----------------------------- | ------ | -------------------------- |
| `getTransactions()`           | Server | Lista todas as transações  |
| `getTransactionById(id)`      | Server | Busca uma transação por id |
| `createTransaction(data)`     | Client | Cria uma nova transação    |
| `updateTransaction(id, data)` | Client | Edita uma transação        |
| `deleteTransaction(id)`       | Client | Exclui uma transação       |

## Estrutura do projeto

```
C:\bytebank-app
├── public/
├── src/
|  ├── app/
|  |  ├── api/               # API Routes
|  |  ├── globals.scss
|  |  ├── layout.tsx
|  |  ├── page.tsx
|  |  └── transactions/      # Página de listagem e detalhes
|  ├── components/
|  |  ├── layout/            # Header, Footer
|  |  ├── transactions/      # Componentes de transação
|  |  └── ui/                # Componentes genéricos
|  ├── data/
|  |  └── transactions.json  # Mock de dados
|  ├── services/
|  |  └── transactions.ts    # Funções de acesso à API
|  ├── styles/
|  |  ├── mixins.scss        # Mixins de responsividade
|  |  └── variables.scss     # Variáveis globais
|  └── types/
|     └── transaction.ts     # Tipagem
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Equipe

| Nome                                                 | Responsabilidade                  |
| ---------------------------------------------------- | --------------------------------- |
| [@kaleobonatto](https://github.com/kaleobonatto)     | Setup, arquitetura e API Routes   |
| [@vitoraf](https://github.com/vitoraf)               | Design System / Storybook / Vídeo |
| [@brendobc](https://github.com/brendobc)             | Design System / Storybook / Vídeo |
| [@ramillecsantos](https://github.com/ramillecsantos) | Home page                         |
| [@carlosjosecjr](https://github.com/carlosjosecjr)   | Adicionar/Editar transação        |
