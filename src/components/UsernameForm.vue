<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  connected: boolean
  error?: string
}>()
const emit = defineEmits<{
  login: [name: string]
}>()

const name = ref('')

function isDisabledButton() {
  return !props.connected || !name.value.trim()
}

function submit() {
  if (name.value.trim()) emit('login', name.value.trim())
}
</script>

<template>
  <form
    class="login"
    @submit.prevent="submit"
  >
    <h1 class="login__title">Socket.IO Chat</h1>
    <input
      v-model="name"
      class="login__input"
      placeholder="Choose an username"
      maxlength="20"
    />
    <p
      v-if="error"
      class="login__error"
    >
      {{ error }}
    </p>
    <button
      class="login__button"
      :disabled="isDisabledButton()"
    >
      {{ connected ? 'Enter' : 'Connecting to the server…' }}
    </button>
  </form>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: calc(100% - 2rem);
  max-width: 320px;
  margin: 20vh auto 0;
  border-radius: 10px;
  padding: 1.5rem;
  background: var(--color-white);
  box-shadow: 0 2px 8px var(--color-shadow);
}

.login__title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-secondary);
}

.login__input {
  border: 1px solid var(--color-border-strong);
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 1rem;
}

.login__error {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-danger);
}

.login__button {
  border: 0;
  border-radius: 6px;
  padding: 0.5rem 0.9rem;
  color: var(--color-white);
  background: var(--color-primary);
  cursor: pointer;
}

.login__button:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (width >= 768px) {
  .login__input {
    font-size: 0.95rem;
  }
}
</style>
