# Autenticação com JWT Token

Este projeto agora implementa autenticação com JWT (JSON Web Tokens).

## 📋 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
JWT_SECRET=seu-secret-super-seguro-aqui
```

**Importante**: Em produção, use um valor seguro e complexo!

## 🔐 Como Funciona

### Fluxo de Login

1. Usuário faz login com email e senha
2. Servidor valida credenciais
3. Se válido, gera um JWT token
4. Token é retornado ao cliente e armazenado em:
   - `localStorage` (para acesso via JavaScript)
   - Cookie httpOnly (para requisições automáticas)

### Fluxo de Logout

1. Usuário clica em logout
2. Token é removido do localStorage
3. Cookie é deletado no servidor

## 💻 Como Usar

### 1. Login

```typescript
import { useAuth } from '@bytebank/shared'

export function LoginPage() {
  const { login, error, loading } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      // Você será redirecionado automaticamente
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

```typescript
import { authenticatedFetch } from '@bytebank/shared'

// Exemplo: buscar transações
const response = await authenticatedFetch('/api/transactions', {
  method: 'GET',
})

const data = await response.json()
```

### 3. Verificar Autenticação

```typescript
import { useAuth } from '@bytebank/shared'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Faça login para continuar</div>
  }

  return (
    <div>
      <p>Bem-vindo, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### 4. Verificar Expiração do Token

```typescript
import { getAuthToken, isTokenExpired } from '@bytebank/shared'

const token = getAuthToken()
if (token && isTokenExpired(token)) {
  console.log('Token expirado, faça login novamente')
}
```

## 🛡️ Rotas Protegidas

O middleware protege automaticamente as rotas definidas em `/apps/shell/src/middleware.ts`:

- `/`
- `/transactions`

Se um usuário não autenticado tentar acessar estas rotas, será redirecionado para `/auth`.

## 📦 Estrutura de Arquivos

```
apps/mfe-auth/
├── src/
│   ├── lib/
│   │   └── jwt.ts (configuração de JWT)
│   ├── app/
│   │   └── auth/
│   │       ├── api/
│   │       │   ├── login/
│   │       │   │   └── route.ts (gera token)
│   │       │   └── logout/
│   │       │       └── route.ts (limpa token)

packages/shared/
├── src/
│   ├── contexts/
│   │   └── AuthProvider/
│   │       └── AuthProvider.tsx (gerencia estado)
│   └── utils/
│       └── token.ts (utilitários de token)

apps/shell/
└── src/
    └── middleware.ts (protege rotas)
```

## 🚀 Próximos Passos

1. Instale as dependências: `npm install`
2. Configure a `JWT_SECRET` no `.env.local`
3. Teste o login na página `/auth`
4. Experimente acessar rotas protegidas

## ⚠️ Segurança

- **Nunca** exponha a `JWT_SECRET` publicamente
- Use `NODE_ENV === 'production'` para certificar que cookies são seguros
- O token tem expiração de **24 horas** (configurável em `apps/mfe-auth/src/lib/jwt.ts`)
- Para tokens sensíveis, considere usar um refresh token strategy
