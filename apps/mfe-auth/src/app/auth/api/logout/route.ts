import { createLogoutResponse } from '@/server/sessionResponse'

export async function POST() {
  return createLogoutResponse()
}
