import type { WebSocketHandler } from 'h3'

declare global {
  function defineWebSocketHandler(handler: WebSocketHandler): WebSocketHandler
}

export {}
