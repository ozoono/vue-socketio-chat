import { createHash, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { Server, type Socket } from 'socket.io'
import { EMOJIS } from '@shared/types.ts'
import type {
  ChatMessage,
  ClientToServerEvents,
  JoinResult,
  ServerToClientEvents,
  SocketData,
  SystemMessage,
} from '@shared/types.ts'

const PORT = Number(process.env.PORT) || 3000

interface RoomConfig {
  name: string
  private: boolean
  password?: string
}

// The password of a private room never leaves the server: roomsSummary() only
// tells the clients that the room is private. Set DEV_ROOM_PASSWORD in
// production; the default is only meant for local demos.
const ROOMS: RoomConfig[] = [
  { name: 'general', private: false },
  { name: 'random', private: false },
  {
    name: 'dev',
    private: true,
    password: process.env.DEV_ROOM_PASSWORD ?? 'secret',
  },
]
const HISTORY_LIMIT = 50

// In-memory state: the server is the single source of truth for rooms,
// who is in each one, and the message history.
const history = new Map<string, ChatMessage[]>(
  ROOMS.map((roomInfo) => [roomInfo.name, []]),
)

// Usernames in use across all rooms: lowercase username -> socket id
const usernames = new Map<string, string>()

const httpServer = createServer()
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>(httpServer)

// Room list sent to the clients: name, people inside and whether it is private
function roomsSummary() {
  return ROOMS.map((roomInfo) => ({
    name: roomInfo.name,
    count: io.sockets.adapter.rooms.get(roomInfo.name)?.size ?? 0,
    private: roomInfo.private,
  }))
}

// Sends the room its updated member list, and everyone the new room counts
async function broadcastPresence(room: string) {
  const sockets = await io.in(room).fetchSockets()
  const members = sockets.map((s) => ({
    id: s.id,
    username: s.data.username ?? 'unknown',
  }))
  io.to(room).emit('members', members)
  io.emit('rooms', roomsSummary())
}

// Stores a message in the room history (only the last ones are kept) and
// sends it to the room
function postMessage(room: string, message: ChatMessage) {
  const messages = history.get(room)
  if (!messages) return

  messages.push(message)
  if (messages.length > HISTORY_LIMIT) messages.shift()
  io.to(room).emit('message', message)
}

// Builds a system notice, such as "alice joined"
function system(text: string): SystemMessage {
  return { system: true, text, time: Date.now() }
}

type ChatSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>

// A socket keeps the username it reserved first for its whole session.
// Check and reserve happen in one synchronous step: nothing may be awaited in
// between, or another socket could take the same name.
function reserveUsername(socket: ChatSocket, name: string) {
  if (socket.data.username) return true

  const key = name.toLowerCase()
  if (usernames.has(key)) return false

  usernames.set(key, socket.id)
  socket.data.username = name
  return true
}

// Frees the username of a socket so someone else can use it
function releaseUsername(socket: ChatSocket) {
  const name = socket.data.username
  if (name) usernames.delete(name.toLowerCase())
}

// Takes the socket out of its room. It does nothing when the socket is not in
// one, so it is safe to call before every join attempt.
async function leaveRoom(socket: ChatSocket) {
  const room = socket.data.room
  if (!room) return

  socket.data.room = undefined
  socket.leave(room)
  postMessage(room, system(`${socket.data.username} left`))
  await broadcastPresence(room)
}

// Puts the socket in a room, sends it the history and announces it
async function enterRoom(socket: ChatSocket, room: string) {
  socket.data.room = room
  socket.join(room)

  socket.emit('history', { room, messages: history.get(room) ?? [] })
  postMessage(room, system(`${socket.data.username} joined`))
  await broadcastPresence(room)
}

// True when the password is right, or the room has none. It compares hashes,
// so the check takes the same time for any input.
function passwordMatches(room: RoomConfig, password: string | undefined) {
  if (!room.password) return true
  if (typeof password !== 'string') return false

  const given = createHash('sha256').update(password).digest()
  const expected = createHash('sha256').update(room.password).digest()
  return timingSafeEqual(given, expected)
}

// The ack is how the client learns whether the join was accepted
function reply(
  ack: ((result: JoinResult) => void) | undefined,
  result: JoinResult,
) {
  if (typeof ack === 'function') ack(result)
}

// Every browser that connects gets its own socket
io.on('connection', (socket) => {
  socket.emit('rooms', roomsSummary())

  // join: check the input, reserve the username, leave the old room, check the
  // room password and enter the new one
  socket.on('join', async ({ room, username, password }, ack) => {
    const name = username?.trim().slice(0, 20)
    const roomInfo = ROOMS.find((candidate) => candidate.name === room)
    if (!roomInfo || !name) {
      return reply(ack, {
        ok: false,
        code: 'invalid',
        error: 'Invalid room or username',
      })
    }
    if (!reserveUsername(socket, name)) {
      return reply(ack, {
        ok: false,
        code: 'username-taken',
        error: 'That username is taken',
      })
    }
    if (socket.data.room === room) return reply(ack, { ok: true })

    // Leaving never depends on the new room: the socket is out of its old room
    // from here on, and what happens next is decided by the room it asks for.
    await leaveRoom(socket)

    if (roomInfo.private && !password) {
      return reply(ack, {
        ok: false,
        code: 'password-required',
        error: 'This room is private',
      })
    }
    if (!passwordMatches(roomInfo, password)) {
      return reply(ack, {
        ok: false,
        code: 'wrong-password',
        error: 'Wrong password',
      })
    }

    await enterRoom(socket, room)
    reply(ack, { ok: true })
  })

  // message: sends a text or emoji message to the room the sender is in
  socket.on('message', ({ text, type }) => {
    const { room, username } = socket.data
    if (!room || !username || typeof text !== 'string' || !text.trim()) return

    // Emoji messages must be one of the offered emojis, so the client can
    // render them without ever treating the content as HTML.
    if (type === 'emoji' && !EMOJIS.includes(text)) return
    if (type !== 'text' && type !== 'emoji') return

    postMessage(room, {
      userId: socket.id,
      username,
      text: text.trim().slice(0, 500),
      time: Date.now(),
      type,
    })
  })

  // disconnect: frees the username and takes the socket out of its room
  socket.on('disconnect', async () => {
    releaseUsername(socket)
    await leaveRoom(socket)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on http://localhost:${PORT}`)
})
