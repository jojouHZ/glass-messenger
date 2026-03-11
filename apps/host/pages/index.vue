<script setup lang="ts">
const FriendsList = defineAsyncComponent(() =>
  import('friends/FriendsList').then((m) => m.default || m),
)
const ChatWindow = defineAsyncComponent(() => import('chat/ChatWindow').then((m) => m.default || m))
</script>

<template>
  <div class="home">
    <section class="home__panel">
      <h1 class="home__title">Welcome to Glass Messenger</h1>
      <p class="home__subtitle">
        Remotes are loaded via Module Federation. Content below comes from friends/chat apps.
      </p>

      <div class="home__placeholder-grid">
        <div class="home__column home__column--sidebar">
          <Suspense>
            <FriendsList />
            <template #fallback>
              <div class="home__chip">Loading Friends remote…</div>
            </template>
          </Suspense>
        </div>

        <div class="home__column home__column--chat">
          <Suspense>
            <ChatWindow />
            <template #fallback>
              <div class="home__chip home__chip--primary">Loading Chat remote…</div>
            </template>
          </Suspense>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.home__panel {
  width: 100%;
  max-width: 960px;
  background: radial-gradient(circle at top left, #1f2937 0, #020617 55%, #000 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.9),
    0 0 0 1px rgba(148, 163, 184, 0.25);
  color: var(--color-text);
}

.home__title {
  font-size: 1.4rem;
  margin-bottom: var(--spacing-sm);
}

.home__subtitle {
  color: var(--color-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.home__placeholder-grid {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: var(--spacing-md);
}

.home__column {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.home__column--sidebar {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.6));
}

.home__column--chat {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 64, 175, 0.5));
}

.home__chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--color-muted);
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.home__chip--primary {
  color: var(--color-text);
  border-color: rgba(129, 140, 248, 0.9);
}
</style>
