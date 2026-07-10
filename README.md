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

   ```bash
   git clone https://github.com/bytebank-postech/bytebank-app.git
   ```

2. Instale as dependências

   ```bash
   npm install
   ```

3. Rode o projeto

   ```bash
   npm run dev
   ```

4. Acesse no navegador

   ```
   http://localhost:3000
   ```

## Docker

O Compose executa cada microfrontend em um container e expõe somente o
`shell`, que funciona como gateway para os demais.

```bash
docker compose up --build
```

Acesse `http://localhost:3000`. Para encerrar, use `docker compose down`.

As URLs internas dos MFEs usadas nos rewrites do `shell` são definidas no
build por `MFE_HOME_URL`, `MFE_TRANSACTIONS_URL` e `MFE_AUTH_URL`. Os valores
padrão do Compose usam os nomes dos serviços Docker; copie `.env.example` para
`.env` somente se precisar alterá-los ou trocar a porta pública `SHELL_PORT`.

No desenvolvimento fora do Docker, nenhuma variável é necessária: o `shell`
mantém os destinos `localhost:3001`, `localhost:3002` e `localhost:3003`.
Como os rewrites são gerados no build do Next, toda alteração dessas variáveis
exige recriar a imagem do `shell`.

## API

A aplicação possui uma API fake com as seguintes rotas:

| Método | Rota                   | Descrição                  |
| ------ | ---------------------- | -------------------------- |
| GET    | /api/transactions      | Lista todas as transações  |
| POST   | /api/transactions      | Cria uma nova transação    |
| GET    | /api/transactions/[id] | Busca uma transação por id |
| PUT    | /api/transactions/[id] | Edita uma transação        |
| DELETE | /api/transactions/[id] | Exclui uma transação       |

## Módulo de transações (front)

**Cliente HTTP** — `src/services/transactions.ts` (comunicação com `/api/transactions`):

| Função                        | Descrição                  |
| ----------------------------- | -------------------------- |
| `getTransactions()`           | Lista todas as transações  |
| `getTransactionById(id)`      | Busca uma transação por id |
| `createTransaction(data)`     | Cria uma nova transação    |
| `updateTransaction(id, data)` | Edita uma transação        |
| `deleteTransaction(id)`       | Exclui uma transação       |

**Helpers de domínio/UI** — `src/app/transactions/model.ts` (formatação e agregação usadas na home e na listagem):

| Função / tipo                | Descrição                  |
| ---------------------------- | -------------------------- |
| `totalBalance()`             | Soma dos valores (saldo)   |
| `formatDisplayDate()`        | Data para exibição (pt-BR) |
| `groupTransactionsByMonth()` | Agrupa transações por mês  |
| `MonthGroup`                 | Tipo do agrupamento mensal |

## Estrutura do projeto

```
bytebank-app/
├── public/
├── src/
│   ├── app/
│   │   ├── api/                 # API Routes
│   │   ├── globals.scss
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── transactions/        # Páginas /transactions, model.ts (helpers)
│   ├── components/
│   │   ├── layout/              # Menu, Header
│   │   └── ui/                  # Design system (Button, TransactionItem, …)
│   ├── data/
│   │   └── transactions.json    # Mock de dados
│   ├── services/
│   │   └── transactions.ts      # Cliente HTTP da API de transações
│   ├── styles/
│   │   ├── mixins.scss          # Mixins de responsividade
│   │   └── variables.scss       # Variáveis globais
│   └── types/
│       └── transaction.ts       # Tipagem
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
