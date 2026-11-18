import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64
const SALT_LENGTH = 16

const deriveKey = (password: string, salt: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }
      resolve(derivedKey)
    })
  })

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH).toString('hex')
  const derivedKey = await deriveKey(password, salt)
  return `${salt}:${derivedKey.toString('hex')}`
}

export const verifyPassword = async (
  password: string,
  storedHash: string
): Promise<boolean> => {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) return false

  const expected = Buffer.from(hash, 'hex')
  const actual = await deriveKey(password, salt)
  if (expected.length !== actual.length) return false

  return timingSafeEqual(expected, actual)
}
