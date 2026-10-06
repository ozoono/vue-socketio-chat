<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage } from '@shared/types.ts'

const props = defineProps<{ messages: ChatMessage[]; myId: string }>()

const list = ref<HTMLElement | null>(null)

watch(
  () => props.messages.length,
  () =>
    nextTick(() => {
      if (list.value) list.value.scrollTop = list.value.scrollHeight
    }),
)

function messageClass(message: ChatMessage) {
  if (message.system) return 'message--system'

  return message.userId == props.myId ? 'message--own' : 'message--other'
}

function isEmoji(message: ChatMessage) {
  return !message.system && message.type === 'emoji'
}

function itIsMe(id: string) {
  return id == props.myId
}

function time(ms: number) {
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div
    ref="list"
    class="message-list"
  >
    <div
      v-for="(m, i) in messages"
      :key="i"
      class="message"
      :class="[messageClass(m), { 'message--emoji': isEmoji(m) }]"
    >
      <template v-if="m.system">{{ m.text }}</template>
      <template v-else>
        <small
          v-if="itIsMe(m.userId)"
          class="message__meta"
          >{{ m.username }}</small
        >
        {{ m.text }}
        <small class="message__meta">{{ time(m.time) }}</small>
      </template>
    </div>
  </div>
</template>

<style scoped>
.message-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.4rem;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  max-width: 75%;
  border-radius: 12px;
  padding: 0.45rem 0.7rem;
  overflow-wrap: anywhere;
  background: var(--color-neutral);
}

.message--own {
  align-self: flex-end;
  color: var(--color-white);
  background: var(--color-primary);
}

.message--system {
  align-self: center;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  background: none;
}

.message--emoji {
  padding: 0;
  line-height: 1.2;
  font-size: 2.2rem;
  color: var(--color-text-muted);
  background: none;
}

.message__meta {
  display: block;
  opacity: 0.7;
  font-size: 0.7rem;
}
</style>
