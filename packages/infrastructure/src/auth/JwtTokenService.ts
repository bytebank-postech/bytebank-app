import type { TokenService } from '@bytebank/application'
import type { AuthUser } from '@bytebank/domain'
import { jwtVerify, SignJWT } from 'jose'
import { SESSION_DURATION_SECONDS } from './sessionCookie'

const issuer = 'bytebank'
const audience = 'bytebank-app'
const algorithm = 'HS256'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (secret) return new TextEncoder().encode(secret)

  if (process.env.NODE_ENV !== 'production') {
    return new TextEncoder().encode('bytebank-development-secret')
  }

  throw new Error('JWT_SECRET não definido.')
}

export class JwtTokenService implements TokenService {
  async sign(user: AuthUser): Promise<string> {
    return new SignJWT({ name: user.name, email: user.email })
      .setProtectedHeader({ alg: algorithm })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
      .setIssuer(issuer)
      .setAudience(audience)
      .sign(getSecret())
  }

  async verify(token: string): Promise<AuthUser | null> {
    try {
      const { payload } = await jwtVerify(token, getSecret(), {
        issuer,
        audience,
        algorithms: [algorithm],
      })
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
}
