import type { SessionGateway } from '@bytebank/application'
import { HttpSessionGateway } from '../auth/HttpSessionGateway'

let cached: SessionGateway | null = null

export function createClientSessionGateway(): SessionGateway {
  if (!cached) {
    cached = new HttpSessionGateway()
  }

  return cached
}
