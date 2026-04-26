# 🚀 RocketX — Crash Game

A full-stack crash (rocket) game built with React + Vite, Tailwind CSS, Node.js, Express, PostgreSQL, and WebSockets.

---

## 📁 Folder Structure

```
rocketx/
├── client/                      # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Images, fonts, sounds
│   │   ├── components/          # Reusable UI components
│   │   │   ├── BetPanel.tsx
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── MultiplierDisplay.tsx
│   │   │   ├── LiveBetsFeed.tsx
│   │   │   ├── HistoryPanel.tsx
│   │   │   └── TopBar.tsx
│   │   ├── context/
│   │   │   └── GameContext.tsx  # Global game state (socket + data)
│   │   ├── hooks/
│   │   │   ├── useSocket.ts     # WebSocket connection hook
│   │   │   └── useGame.ts       # Game state hook
│   │   ├── pages/
│   │   │   └── GamePage.tsx     # Main game page layout
│   │   ├── utils/
│   │   │   └── formatters.ts    # Number/currency formatters
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── server/                      # Node.js + Express backend
│   ├── sql/
│   │   └── schema.sql           # PostgreSQL schema
│   ├── src/
│   │   ├── db/
│   │   │   └── index.ts         # PostgreSQL connection pool
│   │   ├── routes/
│   │   │   ├── auth.ts          # Auth routes
│   │   │   ├── bets.ts          # Bet history routes
│   │   │   └── rounds.ts        # Round history routes
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── betController.ts
│   │   │   └── roundController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT middleware
│   │   ├── services/
│   │   │   └── gameEngine.ts    # Core crash game logic + WebSocket
│   │   ├── utils/
│   │   │   └── crashPoint.ts    # Provably fair crash generation
│   │   └── index.ts             # Express app entry point
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── package.json                 # Root (concurrently scripts)
└── README.md
```

---

## ⚙️ Prerequisites

- Node.js v18+
- PostgreSQL 14+
- npm or yarn

---

## 🚀 Setup

### 1. Clone & Install
```bash
git clone <repo>
cd rocketx
npm run install:all
```

### 2. Database Setup
```bash
psql -U postgres -c "CREATE DATABASE rocketx;"
psql -U postgres -d rocketx -f server/sql/schema.sql
```

### 3. Environment Variables
```bash
cp server/.env.example server/.env
# Edit server/.env with your values
```

### 4. Run Dev
```bash
npm run dev
```

- Frontend: http://localhost:5173  
- Backend:  http://localhost:3001  
- WebSocket: ws://localhost:3001

---

## 🎮 Game Flow

```
[Waiting Phase 5s] → [Round LIVE: multiplier rises] → [CRASH] → repeat
```

1. Players place bets during the **waiting phase**
2. Round starts — multiplier increases exponentially
3. Players **cash out** before the crash to win
4. If they don't cash out in time → they **lose**
5. Results saved to PostgreSQL; history broadcast via WebSocket

---

## 🔌 WebSocket Events

| Event (Server→Client) | Payload | Description |
|---|---|---|
| `game:waiting` | `{ countdown }` | New round starting |
| `game:started` | `{ roundId }` | Round is live |
| `game:tick` | `{ multiplier }` | Multiplier update (~every 100ms) |
| `game:crashed` | `{ crashPoint }` | Round ended |
| `bet:placed` | `{ userId, amount }` | Someone placed a bet |
| `bet:cashedout` | `{ userId, multiplier, profit }` | Someone cashed out |
| `balance:update` | `{ balance }` | Your balance changed |

| Event (Client→Server) | Payload | Description |
|---|---|---|
| `bet:place` | `{ amount, autoCashout? }` | Place a bet |
| `bet:cashout` | `{}` | Manual cash out |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion + Canvas API |
| State | React Context + useReducer |
| Backend | Node.js, Express, TypeScript |
| Real-time | WebSocket (ws library) |
| Database | PostgreSQL + pg |
| Auth | JWT (jsonwebtoken) |
| Hashing | bcryptjs |