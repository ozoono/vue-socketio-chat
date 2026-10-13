// Types shared by the server and the client, so both sides agree on every event.

export interface Room {
  name: string
  count: number
  private: boolean
}

export interface Member {
  id: string
  username: string
}

export type MessageType = 'text' | 'emoji'

// The only emojis the chat offers. The server rejects any other emoji message.
export const EMOJIS: readonly string[] = ['😀', '👍', '❤️', '😂', '🎉']

export interface UserMessage {
  system?: false
  userId: string
  username: string
  text: string
  time: number
  type: MessageType
}

export interface SystemMessage {
  system: true
  text: string
  time: number
}

export type ChatMessage = UserMessage | SystemMessage

// Why a join was refused. The client uses the code to decide what to show.
export type JoinErrorCode =
  'invalid' | 'username-taken' | 'password-required' | 'wrong-password'

export interface JoinResult {
  ok: boolean
  error?: string
  code?: JoinErrorCode
}

export interface ServerToClientEvents {
  rooms: (rooms: Room[]) => void
  members: (members: Member[]) => void
  history: (payload: { room: string; messages: ChatMessage[] }) => void
  message: (message: ChatMessage) => void
}

export interface ClientToServerEvents {
  join: (
    payload: { room: string; username: string; password?: string },
    ack: (result: JoinResult) => void,
  ) => void
  message: (payload: { text: string; type: MessageType }) => void
}

export interface SocketData {
  username?: string
  room?: string
}
