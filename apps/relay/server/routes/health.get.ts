import { send } from 'h3'

import type { H3Event } from 'h3'

export default async function handleHealth(event: H3Event) {
  return send(event, { status: 'ok', service: 'glass-relay' })
}
