# Autenticação com JWT Token

A autenticação usa JWT assinado no servidor e guardado em cookie `httpOnly`.
Nenhum token trafega pelo `localStorage` nem fica acessível ao JavaScript do
cliente.

## 📋 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
JWT_SECRET=seu-secret-super-seguro-aqui
COOKIE_SECURE=false
```

**Importante**: em produção, use um valor seguro e complexo para `JWT_SECRET` e
`COOKIE_SECURE=true`.

## 🔐 Como Funciona

### Fluxo de Login

1. Usuário envia email e senha para `/auth/api/login`
2. O use case `LoginUser` valida as credenciais
3. Se válido, o `JwtTokenService` assina um token de 24 horas
4. A rota devolve o usuário e grava o token no cookie `auth-token` (`httpOnly`)
5. O `sessionSlice` guarda o usuário no store Redux

### Fluxo de Logout

1. Usuário clica em "Sair"
2. `/auth/api/logout` apaga o cookie `auth-token`
3. O `sessionSlice` limpa o usuário e o `sessionListener` zera as transações

### Restauração de Sessão

No carregamento de qualquer MFE, o `SessionBootstrap` despacha `restoreSession`,
que consulta `/auth/api/session` através do `HttpSessionGateway`.

## 💻 Como Usar

### 1. Login

```tsx
import { useAuth } from '@bytebank/shared'

export function LoginPage() {
  const { login, error, loading } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      window.location.assign('/')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    // seu formulário aqui
  )
}
```

### 2. Fazer Requisições Autenticadas

O cookie é enviado automaticamente pelo browser, então basta usar `fetch`
normalmente — ou, de preferência, os use cases já montados:

```typescript
import { createClientTransactionUseCases } from '@bytebank/infrastructure/client'

const { listTransactions } = createClientTransactionUseCases()
const transactions = await listTransactions.execute()
```

Dentro de componentes, use os hooks facade em vez de chamar a rede direto:

```tsx
import { useTransactionCollection } from '@bytebank/shared'

const { transactions, status, error } = useTransactionCollection('page')
```

### 3. Verificar Autenticação

```tsx
import { useAuth } from '@bytebank/shared'

export function Welcome() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Faça login para continuar</div>
  }

  return (
    <div>
      <p>Bem-vindo, {user?.name}</p>
      <button onClick={() => void logout()}>Logout</button>
    </div>
  )
}
```

### 4. Proteger uma Árvore de Componentes

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

O token expira em 24 horas. Quando isso acontece, `/auth/api/session` responde
sem usuário, o `AuthGuard` detecta o estado anônimo e redireciona para `/auth`.

## 🛡️ Rotas Protegidas

O middleware em `apps/shell/src/middleware.ts` protege tudo que não for `/auth`,
`/api/health` ou assets estáticos. Sem cookie válido, a requisição é
redirecionada para `/auth` antes mesmo de chegar ao MFE.

## 📦 Estrutura de Arquivos

```
apps/mfe-auth/src/app/auth/api/
├── login/route.ts        # valida credenciais e grava o cookie
├── register/route.ts     # cria usuário e grava o cookie
├── logout/route.ts       # apaga o cookie
└── session/route.ts      # devolve o usuário do cookie

packages/application/src/ports/
└── SessionGateway.ts     # contrato de sessão consumido pelo store

packages/infrastructure/src/auth/
├── HttpSessionGateway.ts # cliente browser -> /auth/api/*
└── JwtTokenService.ts    # assinatura e verificação do JWT

packages/shared/src/
├── providers/
│   ├── SessionBootstrap.tsx  # restaura a sessão no mount
│   └── AuthGuard.tsx         # bloqueia a árvore enquanto anônimo
├── hooks/useAuth.ts          # facade de login, logout e usuário
└── store/slices/sessionSlice.ts

apps/shell/src/middleware.ts  # protege as rotas no edge
```

## ⚠️ Segurança

- **Nunca** exponha a `JWT_SECRET` publicamente
- Use `COOKIE_SECURE=true` em produção para só trafegar o cookie sobre HTTPS
- O token expira em **24 horas**; para sessões longas, avalie refresh tokens
- O `AuthGuard` é uma proteção de UX; a barreira real é o middleware do shell
