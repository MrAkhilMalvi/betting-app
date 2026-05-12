# Betting App

A full-stack real-time betting application with a Rocket Crash game, wallet balance, authentication, Google login support, live Socket.IO game updates, and a lucky-draw pool feature.

The project is split into a React/Vite client and a Node.js/Express/PostgreSQL backend.

## Features

- User signup, login, logout, protected session handling, and Google OAuth login
- Cookie-based JWT authentication with access and refresh tokens
- Wallet balance with PostgreSQL-backed transactions
- Rocket Crash betting game with waiting, running, and crashed states
- Real-time game updates using Socket.IO
- Provably fair-style crash seed/hash generation
- Bet placement and cashout flow
- Live bets feed and recent crash history in the UI
- Lucky-draw pool creation, active pool fetch, and pool join flow
- PostgreSQL schema for users, wallets, transactions, rounds, bets, sessions, pools, and pool entries

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| UI/Animation | Lucide React, Framer Motion, React Hot Toast |
| API Client | Axios |
| Realtime | Socket.IO / socket.io-client |
| Backend | Node.js, Express |
| Database | PostgreSQL, pg |
| Auth | JWT, bcrypt, Google OAuth |

## Project Structure

```text
betting-app/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/common/          # Shared UI components
│   │   ├── features/
│   │   │   ├── auth/                   # Auth context, modal, services, guards
│   │   │   ├── betting/                # Rocket game UI, hooks, services, types
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
│   │   ├── config/                     # PostgreSQL and Socket.IO shared config
│   │   ├── database/db.sql             # PostgreSQL schema
│   │   ├── game/                       # Crash logic and in-memory game state
│   │   ├── middleware/                 # Auth and error middleware
│   │   ├── modules/
│   │   │   ├── auth/                   # Auth routes, controllers, services
│   │   │   ├── bet/                    # Bet routes, controllers, services
│   │   │   ├── pool/                   # Pool routes, controllers, services
│   │   │   └── wallet/                 # Wallet routes, controllers, services
│   │   ├── utils/                      # Token and cookie helpers
│   │   ├── app.js                      # Express app
│   │   └── server.js                   # HTTP + Socket.IO server and game loop
│   └── package.json
│
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL 14 or newer
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

JWT_SECRET=your_access_token_secret
REFRESH_SECRET=your_refresh_token_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Note: the Socket.IO client is currently configured in `client/src/providers/socket/socket.ts`. Make sure it points to the same backend port used by `server/.env`.

## Database Setup

Create the database:

```bash
createdb betting_app
```

Load the schema:

```bash
psql -U postgres -d betting_app -f server/src/database/db.sql
```

The backend services call PostgreSQL functions such as `signup_user`, `create_session`, `get_wallet`, `update_balance`, `create_game_round`, `crash_game_round`, `place_bet`, `resolve_bet`, `resolve_lost_bets`, `get_active_pool`, `create_pool`, and `join_pool`. Make sure these functions exist in your database before running the full game flow.

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

Wallet:

| Method | Route | Description | Protected |
| --- | --- | --- | --- |
| `GET` | `/wallet` | Get current user wallet balance | Yes |

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

## Socket.IO Events

Server to client:

| Event | Payload | Description |
| --- | --- | --- |
| `game:init` | `{ multiplier, state, roundId, history }` | Initial game state on connection |
| `game:waiting` | `{ remaining, nextHash }` | Waiting phase countdown and next round hash |
| `game:start` | `{ roundId }` | Round started |
| `game:update` | `{ multiplier, roundId }` | Live multiplier update |
| `game:crash` | `{ multiplier, roundId }` | Round crashed |
| `bet:new` | `{ id, userId, amount, status }` | New bet placed |
| `bet:cashout` | `{ betId, multiplier, payout }` | Bet cashed out |
| `poolWinner` | `data` | Pool winner announcement |
| `poolUpdated` | `data` | Pool state changed |

## Game Flow

```text
Waiting phase -> Round running -> Crash -> Bet resolution -> New waiting phase
```

1. The server starts the game loop when at least one socket client connects.
2. During the waiting phase, players can place bets.
3. The server generates a server seed and publishes the hash for the next round.
4. When the round starts, the multiplier increases every 100ms.
5. Players can cash out while the round is running.
6. When the multiplier reaches the crash point, the round ends.
7. Lost bets are resolved, history is updated, and a new round starts after a short delay.

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

- This is a betting-style demo app. Do not use it with real money without legal review, security review, fraud controls, responsible gaming controls, audit logs, and production-grade financial safeguards.
- Backend CORS uses `CLIENT_URL`, defaulting to `http://localhost:5173`.
- In production, set strong JWT secrets and use HTTPS so cookies are secure.
- The server uses in-memory game state, so multiple backend instances require shared state or a single game coordinator.
- The current schema file defines tables, but the app also depends on PostgreSQL stored functions listed in the database setup section.

