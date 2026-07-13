# ByteBank — Tech Challenge Fase 2

Aplicação de gerenciamento financeiro construída com microfrontends em Next.js.
Inclui Home com indicadores, gestão de transações, autenticação JWT, anexos e
um design system documentado no Storybook.

## Arquitetura

O `shell` é a entrada pública: mantém a API mock, valida a sessão e encaminha
rotas aos MFEs por rewrites do Next.js.

| Módulo | Porta local | Responsabilidade |
| --- | ---: | --- |
| `shell` | 3000 | Gateway, JWT e API de transações |
| `mfe-home` | 3001 | Home, saldo, extrato, criação e gráficos |
| `mfe-transactions` | 3002 | Busca, filtros, paginação, edição e anexos |
| `mfe-auth` | 3003 | Login, logout e sessão |
| `@bytebank/ui` | 6006 | Design system e Storybook |
| `@bytebank/shared` | — | Tipos, serviços e utilitários compartilhados |

Rotas públicas: `/`, `/transactions`, `/auth` e `/api/transactions`.

## Gerenciador de pacotes

O projeto usa exclusivamente **Yarn 3.5.0**, via Corepack. O único lockfile
válido é [yarn.lock](./yarn.lock). Não use `npm install` nem crie
`package-lock.json`.

Pré-requisito: Node.js 20 ou superior.

```bash
corepack enable
corepack yarn install --immutable
```

## Executar localmente

```bash
corepack yarn dev
```

Abra `http://localhost:3000`. O Turbo inicia todos os MFEs; as portas internas
estão descritas na tabela de arquitetura.

Credenciais de demonstração:

```text
E-mail: usuario@bytebank.com
Senha: senha123
```

## Docker

```bash
Copy-Item .env.example .env
docker compose up --build
```

O Compose expõe somente o `shell` em `http://localhost:3000`; os MFEs se
comunicam na rede interna. Para encerrar:

```bash
docker compose down
```

Use uma chave forte em `JWT_SECRET` fora do ambiente local. Transações e
anexos usam a API mock em memória e são reinicializados ao recriar o `shell`.
Para deploy com HTTPS, configure `COOKIE_SECURE=true`; mantenha `false` apenas
ao testar localmente em HTTP.

## Funcionalidades

- Saldo, extrato resumido e gráficos financeiros na Home.
- Criação e edição de transações com validação de campos.
- Sugestão automática de categoria pela descrição, com alteração manual.
- Upload de PDF, PNG e JPEG de até 5 MB; abertura e remoção de anexos.
- Busca, filtros por tipo/mês e paginação server-side.
- Redux Toolkit centraliza filtros, paginação, carregamento e dados da listagem.
- JWT em cookie HTTP-only; middleware protege rotas privadas.

## Storybook e roteiro de apresentação

```bash
corepack yarn storybook
```

Abra `http://localhost:6006` e apresente:

1. Componentes base: `Button`, `Input`, `Select`, `Typography`, `Modal` e `Loader`.
2. Componentes de domínio: `TransactionItem`, `Chart` e `Pagination`.
3. Componentes de layout: `Header`, `Menu`, `Avatar` e `FullScreenDiv`.
4. Aba **Accessibility** para os checks do addon.
5. Código em `packages/ui/src/components`, explicando o reuso entre MFEs.

## Qualidade e validação

```bash
corepack yarn build
corepack yarn test
corepack yarn lint
corepack yarn build-storybook
```

Roteiro sugerido para a demonstração: login → Home → nova transação com anexo
→ filtros e paginação → Storybook → Docker.

## Estrutura

```text
apps/
  shell/                # gateway, middleware JWT e API mock
  mfe-home/             # Home e análises financeiras
  mfe-transactions/     # listagem e gestão de transações
  mfe-auth/             # autenticação
packages/
  ui/                   # design system e Storybook
  shared/               # contratos e serviços compartilhados
```
