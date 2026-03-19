import type { Peer } from 'crossws'

const clients = new Set<Peer>()

export default defineWebSocketHandler({
  open(peer: Peer) {
    clients.add(peer)
    peer.send('welcome from relay')
  },

  message(peer: Peer, msg: any) {
    const text = typeof msg.text === 'function' ? msg.text() : String(msg)

    for (const client of clients) {
      if (client !== peer) {
        client.send(text)
      }
    }
  },

  close(peer: Peer) {
    clients.delete(peer)
  },

  error(peer: Peer, error: unknown) {
    console.error('[ws] error', peer.id, error)
  },
})
