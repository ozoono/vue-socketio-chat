<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  room: string
  error?: string
}>()

const emit = defineEmits<{
  submit: [password: string]
}>()

const password = ref('')
const input = ref<HTMLInputElement | null>(null)

onMounted(() => input.value?.focus())

function submit() {
  if (password.value) emit('submit', password.value)
}
</script>

<template>
  <form
    class="room-password"
    @submit.prevent="submit"
  >
    <h2 class="room-password__title">#{{ room }} is a private room</h2>
    <input
      ref="input"
      v-model="password"
      class="room-password__input"
      type="password"
      placeholder="Password"
      autocomplete="off"
    />
    <p
      v-if="error"
      class="room-password__error"
    >
      {{ error }}
    </p>
    <button
      class="room-password__button"
      :disabled="!password"
    >
      Enter room
    </button>
  </form>
</template>

<style scoped>
.room-password {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.8rem;
  padding: 1.5rem;
}

.room-password__title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-secondary);
}

.room-password__input {
  width: 100%;
  max-width: 280px;
  border: 1px solid var(--color-border-strong);
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 1rem;
}

.room-password__error {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-danger);
}

.room-password__button {
  border: 0;
  border-radius: 6px;
  padding: 0.5rem 0.9rem;
  color: var(--color-white);
  background: var(--color-primary);
  cursor: pointer;
}

.room-password__button:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (width >= 768px) {
  .room-password__input {
    font-size: 0.95rem;
  }
}
</style>
