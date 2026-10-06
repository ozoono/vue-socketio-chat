<script setup lang="ts">
import { ref } from 'vue'
import { EMOJIS, type MessageType } from '@shared/types.ts'

const props = defineProps<{
  disabled: boolean
}>()
const emit = defineEmits<{
  send: [text: string, type: MessageType]
}>()

const draft = ref('')
const showEmojis = ref(false)

function isDisabledButton() {
  return props.disabled || !draft.value.trim()
}

function submit() {
  const text = draft.value.trim()
  if (!text) return
  emit('send', text, 'text')
  draft.value = ''
}

function sendEmoji(emoji: string) {
  emit('send', emoji, 'emoji')
  showEmojis.value = false
}
</script>

<template>
  <form
    class="message-form"
    @submit.prevent="submit"
  >
    <div
      v-if="showEmojis"
      class="message-form__emojis"
    >
      <button
        v-for="emoji in EMOJIS"
        :key="emoji"
        type="button"
        class="message-form__button message-form__button--emoji"
        @click="sendEmoji(emoji)"
      >
        {{ emoji }}
      </button>
    </div>
    <button
      type="button"
      class="message-form__button message-form__button--toggle"
      :disabled="disabled"
      @click="showEmojis = !showEmojis"
    >
      🙂
    </button>
    <input
      v-model="draft"
      class="message-form__input"
      placeholder="Type a message…"
      :disabled="disabled"
    />
    <button
      class="message-form__button"
      :disabled="isDisabledButton()"
    >
      Send
    </button>
  </form>
</template>

<style scoped>
.message-form {
  position: relative;
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid var(--color-border);
  padding: 0.6rem 1rem;
}

.message-form__input {
  flex: 1;
  border: 1px solid var(--color-border-strong);
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 1rem;
}

.message-form__button {
  border: 0;
  border-radius: 6px;
  padding: 0.5rem 0.9rem;
  color: var(--color-white);
  background: var(--color-secondary);
  cursor: pointer;
}

.message-form__button:disabled {
  opacity: 0.5;
  cursor: default;
}

.message-form__button--toggle {
  background: var(--color-neutral);
}

.message-form__button--emoji {
  padding: 0.2rem 0.4rem;
  font-size: 1.4rem;
  background: none;
}

.message-form__button--emoji:hover {
  background: var(--color-neutral);
}

.message-form__emojis {
  position: absolute;
  bottom: 100%;
  left: 1rem;
  display: flex;
  gap: 0.3rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.4rem;
  background: var(--color-white);
  box-shadow: 0 2px 8px var(--color-shadow);
}

@media (width >= 768px) {
  .message-form__input {
    font-size: 0.95rem;
  }
}
</style>
