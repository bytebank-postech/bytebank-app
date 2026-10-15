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

Entidades (`Transaction`, `AuthUser`), regras puras (`totalBalance`, `amountForType`, `suggestTransactionCategory`, validação de anexos). Sem React, Next, `fetch` ou `jose`.

### Application (`@bytebank/application`)

- **Ports:** `TransactionRepository`, `AuthUserRepository`, `TokenService`
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

Entradas separadas para não misturar código de servidor no client:

- `@bytebank/infrastructure/client` — HTTP + use cases de cliente
- `@bytebank/infrastructure/server` — in-memory, JWT, auth, use cases de servidor

### Shared (`@bytebank/shared`)

Camada de apresentação compartilhada: `AuthProvider` / `AuthGuard` / `useAuth`, Redux (`StoreProvider`, `loadTransactions`), `getClassnames`. Não exporta JWT nem repositórios.

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
Login UI → AuthProvider → /auth/api/login
  → LoginUser (InMemoryUserRepository + JwtTokenService)
  → cookie httpOnly auth-token
shell middleware → TokenService.verify
AuthGuard (client) → /auth/api/session → GetSession
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

## Dívida conhecida

- `Header` em `@bytebank/ui` ainda chama `/auth/api/session` e logout diretamente (fora do `useAuth`). Preferível receber `user` / `onLogout` por props em uma evolução futura.
- Arquivos antigos em `packages/shared/src` (services, jwt, types) podem permanecer no disco como residual; a API pública do pacote não os exporta mais.

## Validação

```bash
corepack yarn install
corepack yarn build
corepack yarn workspace @bytebank/domain test
corepack yarn workspace @bytebank/application test
```
