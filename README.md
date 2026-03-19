# glass

A stateless, end-to-end encrypted messenger built on Web Crypto API.
The server relays encrypted blobs — it is architecturally impossible to read message content.

> **open-glass** · AGPL core · self-hosted · invite-only · zero server storage
> **working-glass** · commercial tier · B2B · managed relay · admin panel
> **shining-glass** · creator channels · E2EE publishing · coming later

---

## Stack

- [Vite](https://vitejs.dev/) + [Vue 3](https://vuejs.org/) + TypeScript
- [Module Federation](https://module-federation.io/) — host + remotes architecture
- [Nitro](https://nitro.unjs.io/) — WebSocket relay server
- [Dexie](https://dexie.org/) — IndexedDB local-first storage
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — ECDH P-256 key exchange, AES-GCM encryption
- [Turborepo](https://turbo.build/) + Yarn Berry — monorepo

## Monorepo Structure
- apps/
- host/ — shell, auth, routing
- friends/ — contacts remote (MF)
- chat/ — chat window remote (MF)
- packages/
- types/ — shared TypeScript interfaces
- ui/ — shared design tokens and components
- ws-client/ — Dexie schema, crypto, useChat composable


## Security Model

- End-to-end encrypted: server never sees plaintext
- ECDH P-256 key exchange per room
- AES-GCM encryption with unique IV per message
- Keys stored in IndexedDB — never leave the browser
- Redis TTL 48h for offline message buffer — encrypted blobs only
- Stateless relay: no persistent message storage

## License

open-glass is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.
See [LICENSE](./LICENSE) for full terms.

**Commercial licensing** for embedding glass in proprietary products or offering it
as a managed service is available separately.

© 2026 Roman Suleymanov
