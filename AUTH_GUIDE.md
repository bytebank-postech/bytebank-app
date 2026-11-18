# Autenticação e Segurança

A autenticação usa JWT assinado no servidor e guardado em cookie `httpOnly`.
O token nunca trafega no corpo das respostas, não fica em `localStorage` e não é
acessível ao JavaScript do cliente.

## 📋 Configuração

### Variáveis de Ambiente

| Variável        | Uso                                                                  |
| --------------- | -------------------------------------------------------------------- |
| `JWT_SECRET`    | Segredo HS256. Obrigatório com `NODE_ENV=production`.                |
| `COOKIE_SECURE` | `true` em HTTPS, para o cookie só trafegar em canal seguro.          |

- **Docker Compose:** copie `.env.example` para `.env` na raiz.
- **`yarn dev` / `yarn start`:** exporte as variáveis no terminal. O Turbo as
  repassa aos apps (`passThroughEnv` em `turbo.json`). Em `yarn dev`, sem
  `JWT_SECRET`, é usado um segredo fixo de desenvolvimento.

```bash
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")"
export COOKIE_SECURE=false
corepack yarn start
```

**Importante**: nunca versione o `JWT_SECRET`. Use `COOKIE_SECURE=true` em
produção.

## 🔐 Como Funciona

### Fluxo de Login

1. Usuário envia e-mail e senha para `/auth/api/login`.
2. O `LoginAttemptLimiter` recusa com `429` após 5 falhas em 15 minutos para o
   mesmo e-mail.
3. O use case `LoginUser` valida as credenciais; o `InMemoryUserRepository`
   compara a senha com o hash `scrypt` em tempo constante.
4. O `JwtTokenService` assina um token de **8 horas** (`SESSION_DURATION_SECONDS`).
5. A rota devolve apenas `{ user }` e grava o cookie `auth-token`
   (`httpOnly`, `sameSite=lax`, `secure` conforme `COOKIE_SECURE`).
6. O `sessionSlice` guarda o usuário no store Redux.

### Fluxo de Logout

1. Usuário clica em "Sair".
2. `/auth/api/logout` expira o cookie `auth-token`.
3. O `sessionSlice` limpa o usuário; o `sessionListener` zera as transações, o
   cache do React Query e o cache de navegação.

### Restauração e Expiração de Sessão

- No carregamento de qualquer MFE, o `SessionBootstrap` despacha
  `restoreSession`, que consulta `/auth/api/session`.
- Quando o token expira, o `proxy.ts` e as rotas da API respondem `401` em JSON.
- Ao falhar uma operação de transações, o `sessionListener` reconsulta a sessão.
  Se ela não existir mais, despacha `sessionExpired`: os caches são limpos e o
  `AuthGuard` redireciona para `/auth`. Falhas de rede ou de validação não
  encerram a sessão.

## 🛡️ Autorização e Isolamento de Dados

Duas camadas protegem a API:

1. **`apps/shell/src/proxy.ts`** — bloqueia tudo que não for `/auth`,
   `/api/health` ou assets. Páginas sem sessão são redirecionadas para `/auth`;
   chamadas `/api/*` recebem `401`.
2. **`withAuthenticatedUser`** (`apps/shell/src/server/authentication.ts`) —
   cada handler valida o JWT de novo. A API continua protegida mesmo se o proxy
   for contornado.

Cada transação pertence a um usuário (`ownerId`, guardado apenas no servidor).
`createServerTransactionUseCases(user.id)` monta um repositório restrito ao
dono: transações e anexos de outro usuário respondem `404`. Os dados de exemplo
pertencem à conta de demonstração; contas novas começam vazias.

O corpo de `POST`/`PUT` passa por `parseTransactionInput`: apenas `type`,
`name`, `amount`, `date` e `category` são aceitos e validados. `id`, `ownerId`
e `attachments` enviados pelo cliente são descartados.

## 🔒 Outras Proteções

- Senhas armazenadas somente como `salt:hash` (`scrypt`, `node:crypto`).
- `jwtVerify` aceita apenas `HS256`, com `issuer` e `audience` fixos.
- Headers em todas as páginas (`security-headers.ts`): `X-Frame-Options`,
  `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy` e `Permissions-Policy`.
- `Cache-Control: no-store` em `/auth/api/*` e `private, no-store` em
  `/api/transactions/*`.
- Download de anexos com `nosniff` e nome de arquivo codificado no
  `Content-Disposition`.

## 💻 Como Usar no Front-end

```tsx
import { useAuth } from '@bytebank/shared'

const { user, isAuthenticated, login, logout } = useAuth()
```

Proteja árvores de componentes com o `AuthGuard` (proteção de UX; a barreira
real está no servidor):

```tsx
import { AppProviders, AuthGuard } from '@bytebank/shared'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AuthGuard>{children}</AuthGuard>
    </AppProviders>
  )
}
```

## 📦 Estrutura de Arquivos

```
apps/mfe-auth/src/
├── app/auth/api/{login,register,logout,session}/route.ts
└── server/sessionResponse.ts      # leitura de credenciais e cookie de sessão

apps/shell/src/
├── proxy.ts                       # barreira de rotas
└── server/
    ├── authentication.ts          # withAuthenticatedUser e resposta 401
    ├── parseTransactionInput.ts   # validação do corpo das transações
    └── errorResponse.ts

packages/infrastructure/src/auth/
├── JwtTokenService.ts
├── InMemoryUserRepository.ts
├── passwordHasher.ts
├── LoginAttemptLimiter.ts
└── sessionCookie.ts               # nome, duração e opções do cookie

packages/shared/src/store/
├── slices/sessionSlice.ts         # sessionExpired
└── listeners/sessionListeners.ts  # limpeza de caches e detecção de expiração
```

## ⚠️ Limitações Conhecidas

- **Revogação de token:** o logout expira o cookie, mas um JWT copiado continua
  válido até expirar (8 horas). Revogar no servidor exige um armazenamento
  compartilhado entre `mfe-auth` e `shell` (por exemplo, Redis com lista de
  `jti` revogados), que o projeto não possui.
- **Persistência em memória:** usuários, transações e limites de tentativa são
  perdidos ao reiniciar os processos e não são compartilhados entre réplicas.
- **Limite de tentativas por e-mail:** um atacante pode bloquear uma conta por
  15 minutos; é a troca aceita para não depender de IP (`x-forwarded-for` pode
  ser forjado).
- **Content-Security-Policy completa** (`script-src` etc.) não foi aplicada:
  exige nonces nas páginas Next.js dos MFEs.
