# Arquitetura — ByteBank

Clean Architecture aplicada ao monorepo de microfrontends.

## Visão geral

```text
apps/          apresentação + adapters HTTP (route handlers finos)
packages/
  domain/          regras e entidades puras
  application/     ports (interfaces) + use cases
  infrastructure/  adapters (HTTP, in-memory, JWT, users)
  shared/          apresentação compartilhada (Auth, Redux, getClassnames)
  ui/              design system
```

## Regra de dependência

```text
apps / ui / shared
  → application + domain + infrastructure (conforme o papel)
application
  → domain apenas
infrastructure
  → application + domain
domain
  → ninguém do monorepo
```

| Pacote                     | Pode depender de                                           |
| -------------------------- | ---------------------------------------------------------- |
| `@bytebank/domain`         | —                                                          |
| `@bytebank/application`    | `@bytebank/domain`                                         |
| `@bytebank/infrastructure` | `@bytebank/application`, `@bytebank/domain`                |
| `@bytebank/shared`         | domain, application, infrastructure/client, React          |
| `@bytebank/ui`             | `@bytebank/domain`, `@bytebank/shared` (utilitários de UI) |
| `apps/*`                   | qualquer pacote acima                                      |

## Responsabilidades

### Domain (`@bytebank/domain`)

Entidades (`Transaction`, `AuthUser`), regras puras (`totalBalance`, `amountForType`, `suggestTransactionCategory`, validação de anexos) e derivações analíticas (`buildMonthlyFlow`, `buildTypeDistribution`, `previewMonthGroups`). Sem React, Next, `fetch` ou `jose`.

### Application (`@bytebank/application`)

- **Ports:** `TransactionRepository`, `AuthUserRepository`, `TokenService`, `SessionGateway`
- **Use cases Auth:** `LoginUser`, `RegisterUser`, `GetSession`
- **Use cases Transactions:** listar, paginar, obter, criar, atualizar, excluir, anexos

Factories: `createTransactionUseCases(repo)`, `createAuthUseCases(users, tokens)`.

### Infrastructure (`@bytebank/infrastructure`)

| Adapter                         | Papel                                 |
| ------------------------------- | ------------------------------------- |
| `InMemoryTransactionRepository` | persistência mock do shell            |
| `HttpTransactionRepository`     | cliente browser → `/api/transactions` |
| `JwtTokenService`               | assinar/verificar JWT (`jose`)        |
| `InMemoryUserRepository`        | usuários de demonstração              |
| `HttpSessionGateway`            | cliente browser → `/auth/api/*`       |

Entradas separadas para não misturar código de servidor no client:

- `@bytebank/infrastructure/client` — HTTP + use cases de cliente
- `@bytebank/infrastructure/server` — in-memory, JWT, auth, use cases de servidor

### Shared (`@bytebank/shared`)

Camada de apresentação compartilhada: store Redux (slices, seletores memoizados, listener middleware), hooks facade, `AppProviders` / `AuthGuard` / `useAuth` e `getClassnames`. Não exporta JWT nem repositórios.

Entradas separadas para o design system não arrastar o store no bundle:

- `@bytebank/shared` — store, providers e hooks
- `@bytebank/shared/utils` — utilitários puros de UI (usado pelo `@bytebank/ui`)
- `@bytebank/shared/store` — apenas a camada de estado

A organização interna e as técnicas reativas estão detalhadas em [`STATE_MANAGEMENT.md`](./STATE_MANAGEMENT.md).

### UI (`@bytebank/ui`)

Componentes visuais. Tipos de domínio vêm de `@bytebank/domain`. Sem chamadas de negócio além do necessário para formulários.

### Apps

- **shell** — gateway, middleware JWT, API de transações (controllers → use cases server)
- **mfe-home / mfe-transactions** — UI + use cases client
- **mfe-auth** — login/session (controllers → use cases auth)

## Fluxo de transações

```text
MFE (client)
  → createClientTransactionUseCases()
  → HttpTransactionRepository
  → shell /api/transactions
  → createServerTransactionUseCases()
  → InMemoryTransactionRepository
```

## Fluxo de autenticação

```text
Login UI → useAuth → signIn → HttpSessionGateway → /auth/api/login
  → LoginUser (InMemoryUserRepository + JwtTokenService)
  → cookie httpOnly auth-token
shell middleware → TokenService.verify
SessionBootstrap (client) → restoreSession → /auth/api/session → GetSession
AuthGuard (client) → segura a árvore enquanto a sessão é desconhecida
```

## Como adicionar um novo módulo

1. Modelar entidades/regras em `@bytebank/domain`.
2. Declarar port + use cases em `@bytebank/application`.
3. Implementar adapter(s) em `@bytebank/infrastructure` (client e/ou server).
4. Expor composition (`createXUseCases`) na entrada adequada (`/client` ou `/server`).
5. Consumir nos apps via use cases; UI só recebe dados/callbacks.
6. Atualizar `transpilePackages` nos `next.config.ts` se criar pacote novo.
7. Adicionar testes de domínio/use case com Vitest no pacote correspondente.

## Legado fora da migração inicial

Análise do repositório confirmou que estes itens **não bloqueiam** build/test dos apps vivos e foram mantidos intocados:

| Item                 | Motivo da exclusão                                       |
| -------------------- | -------------------------------------------------------- |
| `apps/mfe-dashboard` | Sem `package.json` / `src`; fora do Compose e Dockerfile |
| root `src/`          | Árvore vazia; root Next não é workspace Turbo            |

Nenhuma dependência de `apps/shell`, `mfe-home`, `mfe-transactions`, `mfe-auth`, `@bytebank/ui` ou dos novos pacotes aponta para esses caminhos.

## Fluxo de estado no cliente

```text
Página (intenção)
  → hook facade (@bytebank/shared/hooks)
  → thunk / action
  → listener middleware (debounce, takeLatest, invalidação)
  → use case injetado via extraArgument
  → seletor memoizado
  → componente memoizado
```

## Dívida conhecida

- O build do Storybook (`yarn build-storybook`) falha no `@bytebank/ui` por um problema de compilação do webpack anterior a esta etapa; os builds dos apps e os testes passam.
- `AppHeader` é repetido em `mfe-home` e `mfe-transactions`. Centralizá-lo exigiria acoplar o design system ao store (`@bytebank/ui` já depende de `@bytebank/shared`), então a duplicação de seis linhas foi preferida ao ciclo conceitual.
- Em terminais do Windows que entregam a cwd com a letra da unidade em minúsculo (`c:/`), o Vite carrega duas instâncias de `@vitest/expect` e a suíte não inicia. Rodar a partir de um caminho com `C:/` resolve.

## Validação

`yarn test` roda os três pacotes testados em uma única instância do Vitest
(`vitest.config.ts` na raiz usa `projects`), e `yarn lint` passa o ESLint em
`apps` e `packages`.

```bash
corepack yarn install
corepack yarn build
corepack yarn lint
corepack yarn test
```
