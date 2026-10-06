<script setup lang="ts">
import { ref } from 'vue'
import { useChat } from '@/composables/useChat.ts'
import UsernameForm from '@/components/UsernameForm.vue'
import RoomList from '@/components/RoomList.vue'
import RoomPasswordForm from '@/components/RoomPasswordForm.vue'
import MemberList from '@/components/MemberList.vue'
import MessageList from '@/components/MessageList.vue'
import MessageForm from '@/components/MessageForm.vue'

const chat = useChat()
const panelOpen = ref(false)

function selectRoom(room: string) {
  chat.join(room)
  panelOpen.value = false
}

function submitPassword(password: string) {
  chat.join(chat.pendingRoom.value, password)
}
</script>

<template>
  <UsernameForm
    v-if="!chat.username.value"
    :connected="chat.connected.value"
    :error="chat.loginError.value"
    @login="chat.login"
  />

  <div
    v-else
    class="chat"
  >
    <div
      v-if="panelOpen"
      class="chat__backdrop"
      @click="panelOpen = false"
    ></div>

    <aside
      class="chat__sidebar"
      :class="{ 'chat__sidebar--open': panelOpen }"
    >
      <button
        class="chat__close"
        aria-label="Close rooms panel"
        @click="panelOpen = false"
      >
        ✕
      </button>
      <RoomList
        :rooms="chat.rooms.value"
        :current="chat.pendingRoom.value || chat.currentRoom.value"
        :unlocked="chat.unlockedRooms.value"
        @join="selectRoom"
      />
      <MemberList
        :members="chat.members.value"
        :my-id="chat.myId.value"
      />
    </aside>

    <main class="chat__main">
      <header class="chat__header">
        <div class="chat__title">
          <button
            class="chat__menu"
            aria-label="Toggle rooms panel"
            @click="panelOpen = !panelOpen"
          >
            ☰
          </button>
          <h1 class="chat__heading">
            #{{ chat.pendingRoom.value || chat.currentRoom.value }}
          </h1>
        </div>
        <span
          class="chat__status"
          :class="{ 'chat__status--offline': !chat.connected.value }"
        >
          {{ chat.connected.value ? 'Connected' : 'Reconnecting…' }}
        </span>
      </header>
      <RoomPasswordForm
        v-if="chat.pendingRoom.value"
        :key="chat.pendingRoom.value"
        :room="chat.pendingRoom.value"
        :error="chat.joinError.value"
        @submit="submitPassword"
      />
      <template v-else>
        <MessageList
          :messages="chat.messages.value"
          :my-id="chat.myId.value"
        />
        <MessageForm
          :disabled="!chat.connected.value"
          @send="chat.send"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
.chat {
  display: flex;
  overflow: hidden;
  height: 100vh;
  height: 100dvh;
  background: var(--color-white);
}

.chat__sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  overflow-y: auto;
  transform: translateX(-100%);
  width: min(80vw, 280px);
  color: var(--color-white);
  background: var(--color-secondary);
  transition: transform 0.25s ease;
}

.chat__sidebar--open {
  transform: translateX(0);
  box-shadow: 0 0 16px var(--color-shadow);
}

.chat__close {
  display: block;
  margin: 0.6rem 0.8rem 0 auto;
  border: 0;
  padding: 0.2rem 0.4rem;
  line-height: 1;
  font-size: 1.2rem;
  color: var(--color-white);
  background: none;
  cursor: pointer;
}

.chat__close:hover {
  background: var(--color-hover-on-dark);
}

.chat__backdrop {
  position: fixed;
  z-index: 10;
  background: var(--color-backdrop);
  inset: 0;
}

.chat__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.chat__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  color: var(--color-white);
  background: var(--color-primary);
}

.chat__title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.chat__menu {
  display: inline-flex;
  border: 0;
  padding: 0 0.3rem;
  line-height: 1;
  font-size: 1.4rem;
  color: var(--color-white);
  background: none;
  cursor: pointer;
}

.chat__heading {
  margin: 0;
  font-size: 1.1rem;
}

.chat__status {
  font-size: 0.8rem;
}

.chat__status--offline {
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  background: var(--color-danger);
}

@media (width >= 768px) {
  .chat {
    max-width: 760px;
    height: 90vh;
    margin: 0 auto;
    border-radius: 10px;
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  .chat__sidebar {
    position: static;
    transform: none;
    width: 200px;
    border-right: 1px solid var(--color-border);
    transition: none;
  }

  .chat__sidebar--open {
    box-shadow: none;
  }

  .chat__backdrop,
  .chat__menu,
  .chat__close {
    display: none;
  }
}
</style>
