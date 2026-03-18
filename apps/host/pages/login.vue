<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from '#app'

import { useAuthStore } from '~/stores/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

const email = ref('')
const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (auth.isAuthenticated) {
    router.push('/')
  }
})

const emailError = computed<string | null>(() => {
  if (email.value.length === 0) return null
  return EMAIL_RE.test(email.value) ? null : 'Enter a valid email address'
})

const isSubmittable = computed<boolean>(() => email.value.length > 0 && emailError.value === null)

const onSubmit = (): void => {
  if (!isSubmittable.value) return
  auth.loginMock(email.value.trim())
  router.push('/')
}
</script>

<template>
  <main class="login">
    <h1>Glass Messenger</h1>

    <form @submit.prevent="onSubmit">
      <label>
        Email
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          required
        />
        <span v-if="emailError" class="login__error" role="alert">
          {{ emailError }}
        </span>
      </label>

      <button type="submit" :disabled="!isSubmittable">Sign in (mock)</button>
    </form>
  </main>
</template>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: var(--spacing-md, 1rem);

  form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.5rem);
    width: 320px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.875rem;
  }

  input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 6px;
    font-size: 1rem;

    &:focus {
      outline: 2px solid var(--color-primary, #6366f1);
    }
  }

  button {
    padding: 0.625rem;
    border: none;
    border-radius: 6px;
    background: var(--color-primary, #6366f1);
    color: #fff;
    font-size: 1rem;
    cursor: pointer;

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__error {
    color: var(--color-error, #ef4444);
    font-size: 0.75rem;
  }
}
</style>
