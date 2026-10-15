export const ACCEPTED_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
])

export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024

export function isValidAttachment(mimeType: string, size: number): boolean {
  return ACCEPTED_ATTACHMENT_TYPES.has(mimeType) && size <= MAX_ATTACHMENT_SIZE
}
