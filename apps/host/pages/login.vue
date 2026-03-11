<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('demo@example.com')
const password = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  error.value = null
  isSubmitting.value = true

  try {
    if (!email.value || !password.value) {
      error.value = 'Enter email and password'
      return
    }

    // Mock auth for now
    auth.loginMock(email.value)
    await router.push('/')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login">
    <section class="login__panel">
      <h1 class="login__title">Sign in</h1>
      <p class="login__subtitle">Mock authentication. Credentials are not sent anywhere yet.</p>

      <form class="login__form" @submit.prevent="handleSubmit">
        <label class="login__field">
          <span class="login__label">Email</span>
          <input v-model="email" type="email" class="login__input" placeholder="you@example.com" />
        </label>

        <label class="login__field">
          <span class="login__label">Password</span>
          <input v-model="password" type="password" class="login__input" placeholder="••••••••" />
        </label>

        <p v-if="error" class="login__error">
          {{ error }}
        </p>

        <button class="login__button" type="submit" :disabled="isSubmitting">
          <span v-if="!isSubmitting">Continue</span>
          <span v-else>Signing in…</span>
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped lang="scss">
.login {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.login__panel {
  width: 100%;
  max-width: 420px;
  background: radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.9),
    0 0 0 1px rgba(148, 163, 184, 0.25);
  color: var(--color-text);
}

.login__title {
  font-size: 1.4rem;
  margin-bottom: var(--spacing-sm);
}

.login__subtitle {
  color: var(--color-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.login__label {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.login__input {
  padding: 8px 10px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.85);
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.login__input:focus {
  outline: none;
  border-color: rgba(129, 140, 248, 0.95);
  box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.7);
}

.login__error {
  font-size: 0.8rem;
  color: var(--color-danger);
}

.login__button {
  margin-top: var(--spacing-sm);
  width: 100%;
  padding: 8px 12px;
  border-radius: 999px;
  border: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    transform 0.05s ease;
}

.login__button:disabled {
  opacity: 0.7;
  cursor: default;
}
</style>
