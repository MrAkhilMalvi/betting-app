# Betting App

A full-stack real-time betting application with a Rocket Crash game, live Socket.IO updates, user authentication, Google login support, a lucky-draw pool feature, and PostgreSQL-backed persistence.

The project is split into a React/Vite client and a Node.js/Express backend.

## Features

- User signup, login, logout, protected session handling, and Google OAuth login
- Cookie-based JWT authentication and refresh flow
- Wallet balance sync via Socket.IO updates
- Rocket Crash betting game with waiting, running, and crash states
- Real-time bets feed, public cashout events, and live multiplier updates
- Lucky-draw pool creation, active pool fetch, and pool join flow
- Weekly leaderboard endpoint
- PostgreSQL schema plus Redis-backed game state and socket tracking

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| UI/Animation | Lucide React, Framer Motion, React Hot Toast |
| API Client | Axios |
| Realtime | Socket.IO / socket.io-client |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL, pg |
| Cache / State | Redis, ioredis |
| Auth | JWT, bcrypt, Google OAuth |

## Project Structure

```text
BETTING-SITE/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/common/          # Shared UI components
│   │   ├── features/
│   │   │   ├── auth/                   # Auth context, modal, services, guards
│   │   │   ├── betting/                # Rocket game UI, hooks, services, types
│   │   │   ├── leaderboard/            # Leaderboard UI and hooks
│   │   │   └── pool/                   # Pool page, hooks, services, types, utils
│   │   ├── hooks/                      # Shared React hooks
│   │   ├── lib/                        # Small frontend utilities
│   │   ├── pages/                      # Lobby page
│   │   ├── providers/                  # Axios and Socket.IO clients
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/                     # PostgreSQL, Redis, and Socket.IO config
│   │   ├── database/db.sql             # PostgreSQL schema and functions
│   │   ├── game/                       # Crash game engine and state
│   │   ├── middleware/                 # Auth and error middleware
│   │   ├── modules/
│   │   │   ├── auth/                   # Auth routes, controllers, services
│   │   │   ├── bet/                    # Bet routes, controllers, services
│   │   │   ├── pool/                   # Pool routes, controllers, services
│   │   │   └── leaderboard/            # Leaderboard routes and controllers
│   │   ├── app.js                      # Express app setup
│   │   └── server.js                   # HTTP + Socket.IO server and game init
│   └── package.json
│
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL 14 or newer
- Redis
- A Google OAuth client ID if Google login is enabled

## Environment Variables

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

DB_USER=postgres
DB_HOST=localhost
DB_NAME=betting_app
DB_PASSWORD=your_password
DB_PORT=5432

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_access_token_secret
REFRESH_SECRET=your_refresh_token_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Note: the Socket.IO client is currently configured in `client/src/providers/socket/socket.ts` as `http://localhost:3000`. Update it if your backend runs on a different port.

## Database Setup

Create the database:

```bash
createdb betting_app
```

Load the schema:

```bash
psql -U postgres -d betting_app -f server/src/database/db.sql
```

The backend relies on PostgreSQL stored functions defined by the schema for betting and payout workflows.

## Installation

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

## Running Locally

Start the backend:

```bash
cd server
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Available Scripts

Backend:

| Command | Description |
| --- | --- |
| `npm run dev` | Start backend with nodemon |
| `npm start` | Start backend with Node |

Frontend:

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production frontend |
| `npm run preview` | Preview production build |

## API Routes

Base API path:

```text
/api
```

Auth:

| Method | Route | Description | Protected |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Register a new user | No |
| `POST` | `/auth/login` | Login with username/email and password | No |
| `POST` | `/auth/google` | Login with Google ID token | No |
| `POST` | `/auth/logout` | Logout and clear session | No |
| `GET` | `/auth/me` | Get current authenticated user | Yes |
| `POST` | `/auth/welcome` | Claim welcome bonus | Yes |

Bets:

| Method | Route | Description | Protected |
| --- | --- | --- | --- |
| `POST` | `/bet/place` | Place a bet for the current round | Yes |
| `POST` | `/bet/resolve` | Cash out / resolve a bet | Yes |

Pool:

| Method | Route | Description | Protected |
| --- | --- | --- | --- |
| `GET` | `/pool/active` | Get active lucky-draw pool | No |
| `POST` | `/pool/join` | Join a pool | Yes |
| `POST` | `/pool/create` | Create a pool | No |

Leaderboard:

| Method | Route | Description | Protected |
| --- | --- | --- | --- |
| `GET` | `/leaderboard/weekly` | Get weekly leaderboard data | No |

## Socket.IO Events

Server to client:

| Event | Payload | Description |
| --- | --- | --- |
| `game:init` | `{ multiplier, state, roundId, history }` | Initial game state after connecting |
| `game:waiting` | `{ remaining, nextHash }` | Waiting phase countdown and next round hash |
| `game:start` | `{ roundId }` | Round started |
| `game:update` | `{ multiplier, roundId }` | Live multiplier update |
| `game:crash` | `{ multiplier, roundId }` | Round crashed |
| `bet:new` | `{ id, userId, amount, status, roundId }` | New bet placed |
| `wallet:update` | `{ balance }` | Private wallet balance sync |
| `bet:cashout` | `{ betId, userId, multiplier, payout }` | Bet cashout broadcast |
| `poolWinner` | `data` | Pool winner announcement |

## Game Flow

```text
Waiting phase -> Round running -> Crash -> Bet resolution -> New waiting phase
```

1. The server starts the game loop and maintains the current round state in Redis.
2. During the waiting phase, players can place bets.
3. The server generates a hash for the next round and publishes it.
4. When the round starts, the multiplier increases while the game runs.
5. Players can cash out while the round is active.
6. When the multiplier reaches the crash point, the round ends.
7. Lost bets are resolved, history is updated, and a new waiting phase begins.

## Database Tables

The schema in `server/src/database/db.sql` includes:

- `users`
- `wallets`
- `transactions`
- `game_rounds`
- `bets`
- `sessions`
- `pools`
- `pool_entries`
- `leaderboard` materialized view

## Important Notes

- This is a demo betting app. Do not use it with real money without legal review, security review, fraud controls, responsible gaming controls, audit logs, and production-grade financial safeguards.
- Backend CORS uses `CLIENT_URL`, defaulting to `http://localhost:5173`.
- The server uses Redis for game state and socket tracking.
- The current client socket provider is hardcoded to `http://localhost:3000`; update it if your backend uses another port.
- In production, use HTTPS and strong JWT secrets so cookies are secure.
- The app depends on PostgreSQL stored procedures and Redis-backed state for full gameplay.
