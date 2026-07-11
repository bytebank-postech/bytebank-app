/**
 * Obtém o token de autenticação do localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem('bytebank-token')
}

/**
 * Faz uma requisição autenticada, adicionando o token no header
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = getAuthToken()

  const headers = new Headers(options.headers || {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Decodifica um JWT sem verificação de assinatura (apenas leitura no cliente)
 */
export function decodeToken(token: string) {
  try {
    const [, payload] = token.split('.')
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return null
  }
}

/**
 * Verifica se o token está expirado
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < now
}
