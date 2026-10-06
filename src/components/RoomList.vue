<script setup lang="ts">
import type { Room } from '@shared/types.ts'

defineProps<{
  rooms: Room[]
  current: string
  unlocked: string[]
}>()

const emit = defineEmits<{
  join: [room: string]
}>()

function roomIcon(room: Room, unlocked: string[]) {
  if (!room.private) return '✅'

  return unlocked.includes(room.name) ? '🔓' : '🔐'
}
</script>

<template>
  <section class="room-list">
    <h2 class="room-list__title">Rooms</h2>
    <button
      v-for="room in rooms"
      :key="room.name"
      class="room-list__item"
      :class="{ 'room-list__item--active': room.name === current }"
      @click="emit('join', room.name)"
    >
      <span>{{ roomIcon(room, unlocked) }}</span>
      <span>#{{ room.name }}</span>
      <small class="room-list__count">{{ room.count }}</small>
    </button>
  </section>
</template>

<style scoped>
.room-list {
  padding: 0.8rem 0;
}

.room-list__title {
  opacity: 0.7;
  margin: 0 1rem 0.4rem;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.room-list__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 0;
  padding: 0.4rem 1rem;
  text-align: left;
  color: inherit;
  background: none;
  cursor: pointer;
}

.room-list__item:hover {
  background: var(--color-hover-on-dark);
}

.room-list__item--active {
  background: var(--color-primary);
}

.room-list__count {
  flex: 1 1 auto;
  opacity: 0.8;
  text-align: right;
}
</style>
