# Socket.IO Chat

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?logo=vuedotjs&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22+-5FA04E?logo=nodedotjs&logoColor=white)

A real-time, multi-room chat built with **Vue 3**, **Socket.IO** and **TypeScript**.
Rooms, members and message history live on a Node server, and every message
reaches the people in the room through a WebSocket connection.

## Features

- **Rooms** (`general`, `random`, `dev`) with a live count of the people in each.
- **Unique usernames**, checked on the server (case-insensitive).
- **Private rooms** protected by a password. The sidebar shows 🔐 for a locked
  room and 🔓 once you have unlocked it.
- **Text and emoji messages.**
- **Message history:** the last 50 messages of a room when you enter it.
- **Members list** of the room you are in, updated live.
- **Automatic reconnection:** after a network drop you rejoin your room.
- **Responsive, mobile-first layout:** on small screens the sidebar becomes a
  panel that slides in from the left.

## Tech stack

| Area | Tools |
|---|---|
| Frontend | [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`), [Vite](https://vite.dev/), TypeScript |
| Real time | [Socket.IO](https://socket.io/) (`socket.io` and `socket.io-client`) |
| Server | Node.js, run with [tsx](https://tsx.is/) (no build step) |
| Type checking | `vue-tsc` and `tsc`, with types shared by client and server |
| Code quality | ESLint (`eslint-plugin-vue`, `eslint-plugin-import-x`), Prettier, Stylelint (`stylelint-config-standard-vue`, `stylelint-order`) |

## Getting started

**Requirements:** Node.js 22.13 or newer (developed with Node 24) and npm.

```bash
git clone <repository-url>
cd <repository-folder>
npm install
```

The app has two parts, so you need two terminals:

```bash
npm run server   # Socket.IO server on http://localhost:3000
```

```bash
npm run dev      # Vue app on http://localhost:5173
```

Then open <http://localhost:5173> in **two browser windows**, choose a different
username in each one and start chatting.

To try the private room, enter `dev`: the default password is `secret`. To use
another one, start the server with the `DEV_ROOM_PASSWORD` environment variable:

```bash
DEV_ROOM_PASSWORD=my-password npm run server
```

The server port can be changed with `PORT`. In development, Vite forwards
`/socket.io` to port 3000, so the client needs no server address.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vue dev server with hot reload |
| `npm start` | Socket.IO server; it also serves the built web app from `dist/` (`npm run server` is the same command) |
| `npm run build` | Type-check and production build in `dist/` |
| `npm run type-check` | `vue-tsc` for the app, `tsc` for the server and Vite config |
| `npm run lint` | ESLint |
| `npm run lint:style` | Stylelint (CSS in the `.vue` files) |
| `npm run format` / `npm run format:check` | Prettier, write / check only |

## Project structure

```
shared/types.ts            Types used by server and client (events, messages)
server/index.ts            Socket.IO server: rooms, usernames, passwords, history
src/
  App.vue                  Login screen or chat layout
  composables/useChat.ts   Socket connection and all the chat state
  components/              Login form, room list, members, messages, password form
```

## Deployment

The same server serves the built web app and the Socket.IO connection, so a
deployment is a single Node process.

The built app (`dist/`) is not stored in `main`. On every push to `main`, a
GitHub Action ([`deploy.yml`](.github/workflows/deploy.yml)) builds it and
publishes only what is needed to run the app to the **`deploy`** branch: the
built web app, the server, and a minimal `package.json` with just the runtime
dependencies (`socket.io` and `tsx`). The development tools are not installed
on the host, and it runs on Node.js 18 or newer. Deploy from that branch:

```bash
npm install
npm start
```

Set these environment variables:

| Variable | Meaning |
|---|---|
| `PORT` | Port to listen on (default `3000`). Most hosts set it for you |
| `DEV_ROOM_PASSWORD` | Password of the private room. Set your own: the default (`secret`) is public |

To try the production build on your machine, run `npm run build` and then
`npm start`: the app is served at <http://localhost:3000>.

## Limitations

- State is kept in memory: it is lost when the server restarts.
- Rooms are fixed in `server/index.ts`.
- No authentication, and no limit on password attempts.
- Single Node process.
