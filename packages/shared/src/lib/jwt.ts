// TODO JWT secret em variáveis de ambiente
const JWT_SECRET = 'dev-secret-key-change-in-production'
// process.env.JWT_SECRET ||
// (process.env.NODE_ENV === 'development'
//   ? 'dev-secret-key-change-in-production'
//   : undefined)

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET não definido. Configure a variável de ambiente JWT_SECRET no arquivo .env.local'
  )
}

export const JWT_CONFIG = {
  secret: JWT_SECRET,
  expiresIn: '24h' as const,
}
