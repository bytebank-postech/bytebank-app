export function toError(reason: unknown, fallback: string): Error {
  if (reason instanceof Error) return reason

  return new Error(typeof reason === 'string' && reason ? reason : fallback)
}
