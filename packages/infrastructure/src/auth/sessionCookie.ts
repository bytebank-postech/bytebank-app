export const AUTH_COOKIE_NAME = 'auth-token'

export const SESSION_DURATION_SECONDS = 8 * 60 * 60

export type SessionCookieOptions = {
  httpOnly: true
  secure: boolean
  sameSite: 'lax'
  path: '/'
  maxAge: number
}

export const getSessionCookieOptions = (
  maxAge: number = SESSION_DURATION_SECONDS
): SessionCookieOptions => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  path: '/',
  maxAge,
})
