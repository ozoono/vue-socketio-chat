import { ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import type {
  ChatMessage,
  ClientToServerEvents,
  JoinResult,
  Member,
  MessageType,
  Room,
  ServerToClientEvents,
} from '@shared/types.ts'

// All chat state lives here. The server decides rooms, members and history;
// this composable only mirrors what the server sends.
export function useChat() {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io()
  const connected = ref(false)
  const username = ref('')
  const rooms = ref<Room[]>([])
  const currentRoom = ref('')
  const members = ref<Member[]>([])
  const messages = ref<ChatMessage[]>([])
  const myId = ref('')
  const loginError = ref('')
  // A private room waiting for its password, and why the last attempt failed
  const pendingRoom = ref('')
  const joinError = ref('')
  // Private rooms already unlocked. Their passwords are only kept in memory.
  const unlockedRooms = ref<string[]>([])
  const passwords = new Map<string, string>()

  function isPasswordError(result: JoinResult) {
    return (
      result.code === 'password-required' || result.code === 'wrong-password'
    )
  }

  // Asks the server to put us in a room. Resolves with the server's answer, or
  // with an error if it does not answer (e.g. an old server that has no ack).
  function emitJoin(
    room: string,
    name: string,
    password?: string,
  ): Promise<JoinResult> {
    return new Promise((resolve) => {
      socket
        .timeout(5000)
        .emit('join', { room, username: name, password }, (err, result) => {
          resolve(
            err ? { ok: false, error: 'The server did not respond' } : result,
          )
        })
    })
  }

  // Applies the answer to a join. When a private room asks for a password, the
  // server has already taken us out of our previous room, so the chat is empty
  // until the password is accepted.
  function applyJoinResult(
    room: string,
    password: string | undefined,
    result: JoinResult,
  ) {
    if (result.ok) {
      pendingRoom.value = ''
      joinError.value = ''
      if (password) {
        passwords.set(room, password)
        if (!unlockedRooms.value.includes(room)) unlockedRooms.value.push(room)
      }
      return
    }

    if (!isPasswordError(result)) return

    currentRoom.value = ''
    members.value = []
    messages.value = []
    pendingRoom.value = room
    joinError.value =
      result.code === 'wrong-password' ? (result.error ?? '') : ''

    if (result.code === 'wrong-password') {
      passwords.delete(room)
      unlockedRooms.value = unlockedRooms.value.filter((name) => name !== room)
    }
  }

  socket.on('connect', () => {
    connected.value = true
    myId.value = socket.id ?? ''
    // After a reconnection the server has forgotten us: join again
    if (username.value && currentRoom.value) {
      const room = currentRoom.value
      const password = passwords.get(room)

      emitJoin(room, username.value, password).then((result) => {
        if (result.ok) return
        if (isPasswordError(result))
          return applyJoinResult(room, password, result)

        // The name was taken in the meantime: back to the login screen
        username.value = ''
        currentRoom.value = ''
        loginError.value = result.error ?? 'Could not rejoin the room'
      })
    }
  })
  socket.on('disconnect', () => {
    connected.value = false
  })
  socket.on('rooms', (list) => {
    rooms.value = list
  })
  socket.on('members', (list) => {
    members.value = list
  })
  socket.on('history', ({ room, messages: list }) => {
    currentRoom.value = room
    messages.value = list
  })
  socket.on('message', (message) => {
    messages.value.push(message)
  })

  // Without an explicit password it reuses the one already accepted for that
  // room, so an unlocked room opens straight away.
  async function join(room: string, password = passwords.get(room)) {
    const result = await emitJoin(room, username.value, password)
    applyJoinResult(room, password, result)
  }

  async function login(name: string) {
    loginError.value = ''
    const result = await emitJoin('general', name)

    if (result.ok) username.value = name
    else loginError.value = result.error ?? 'Could not join'
  }

  function send(text: string, type: MessageType = 'text') {
    socket.emit('message', { text, type })
  }

  return {
    connected,
    username,
    rooms,
    currentRoom,
    members,
    messages,
    myId,
    loginError,
    pendingRoom,
    joinError,
    unlockedRooms,
    login,
    join,
    send,
  }
}
