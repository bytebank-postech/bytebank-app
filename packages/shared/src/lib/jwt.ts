import { jwtVerify, SignJWT } from 'jose'

export type AuthUser = {
  id: string
  name: string
  email: string
}

const issuer = 'bytebank'
const audience = 'bytebank-app'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (secret) return new TextEncoder().encode(secret)

  if (process.env.NODE_ENV !== 'production') {
    return new TextEncoder().encode('bytebank-development-secret')
  }

  throw new Error('JWT_SECRET não definido.')
}

export async function signAuthToken(user: AuthUser) {
  return new SignJWT({ name: user.name, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('24h')
    .setIssuer(issuer)
    .setAudience(audience)
    .sign(getSecret())
}

export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer, audience })
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      return null
    }

    return { id: payload.sub, name: payload.name, email: payload.email }
  } catch {
    return null
  }
}
