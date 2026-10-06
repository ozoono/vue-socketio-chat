<script setup lang="ts">
import type { Member } from '@shared/types.ts'

const props = defineProps<{
  members: Member[]
  myId: string
}>()

function itIsMe(id: string) {
  return id == props.myId
}
</script>

<template>
  <section class="member-list">
    <h2 class="member-list__title">In this room ({{ members.length }})</h2>
    <p
      v-for="member in members"
      :key="member.id"
      class="member-list__item"
    >
      {{ member.username
      }}<span
        v-if="itIsMe(member.id)"
        class="member-list__you"
      >
        (you)</span
      >
    </p>
  </section>
</template>

<style scoped>
.member-list {
  border-top: 1px solid var(--color-divider-on-dark);
  padding: 0.8rem 1rem;
}

.member-list__title {
  opacity: 0.7;
  margin: 0 0 0.4rem;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.member-list__item {
  margin: 0.2rem 0;
  font-size: 0.9rem;
}

.member-list__you {
  opacity: 0.7;
}
</style>
