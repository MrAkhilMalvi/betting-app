import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { Server } from "socket.io";

import pool from "./config/db.js";

import {
  gameState,
  setGameState,
  currentRoundId,
  setCurrentRound,
} from "./game/game.state.js";

import { setIO } from "./config/socket/socket.js";

import {
  generateServerSeed,
  generateHash,
  calculateCrashPoint,
} from "./game/crash.logic.js";

// ======================================================
// SERVER
// ======================================================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

setIO(io);

// ======================================================
// LOCAL GAME STATE
// ======================================================

let multiplier = 1;
let crashPoint = 1;

let history = [];

let activeUsers = 0;

let gameLoop = null;
let gameStarted = false;

// provably fair
let currentServerSeed = null;
let currentHash = null;

// ======================================================
// SOCKETS
// ======================================================

io.on("connection", (socket) => {
  activeUsers++;

  console.log(`✅ User connected: ${socket.id}`);
  console.log(`👥 Active users: ${activeUsers}`);

  // send current state
  socket.emit("game:init", {
    multiplier,
    state: gameState,
    roundId: currentRoundId,
    history,
  });

  // 🚀 start game ONLY if not running
  if (!gameStarted) {
    gameStarted = true;
    startWaitingPhase();
  }

  socket.on("disconnect", () => {
    activeUsers--;

    console.log(`❌ User disconnected: ${socket.id}`);
    console.log(`👥 Active users: ${activeUsers}`);

    // stop game if nobody online
    if (activeUsers <= 0) {
      console.log("🛑 No users online. Stopping game.");

      gameStarted = false;

      clearInterval(gameLoop);

      setGameState("waiting");

      multiplier = 1;
    }
  });
});

// ======================================================
// WAITING PHASE
// ======================================================

async function startWaitingPhase() {
  // nobody online
  if (activeUsers <= 0) {
    gameStarted = false;
    return;
  }

  setGameState("waiting");

  multiplier = 1;

  // 🔐 generate provably fair data
  currentServerSeed = generateServerSeed();
  currentHash = generateHash(currentServerSeed);

  let remaining = 5;

  io.emit("game:waiting", {
    remaining,
    nextHash: currentHash,
  });

  const waitingTimer = setInterval(() => {
    remaining--;

    io.emit("game:waiting", {
      remaining,
      nextHash: currentHash,
    });

    if (remaining <= 0) {
      clearInterval(waitingTimer);

      startRound();
    }
  }, 1000);
}

// ======================================================
// START ROUND
// ======================================================

async function startRound() {
  try {
    if (activeUsers <= 0) {
      gameStarted = false;
      return;
    }

    setGameState("running");

    multiplier = 1;

    // deterministic crash
    crashPoint = calculateCrashPoint(currentServerSeed);

    // save round ONCE
    const res = await pool.query("SELECT create_game_round($1,$2,$3) AS id", [
      crashPoint,
      currentHash,
      currentServerSeed,
    ]);

    const roundId = res.rows[0].id;

    setCurrentRound(roundId);

    io.emit("game:start", {
      roundId,
    });

    // reset next seed
    currentServerSeed = null;
    currentHash = null;

    runGameLoop();
  } catch (err) {
    console.error("🔥 START ROUND ERROR:", err.message);

    setTimeout(startWaitingPhase, 3000);
  }
}

// ======================================================
// MULTIPLIER LOOP
// ======================================================

function runGameLoop() {
  gameLoop = setInterval(async () => {
    try {
      multiplier += 0.03 + multiplier * 0.01;

      const safeMultiplier = Number(multiplier.toFixed(2));

      io.emit("game:update", {
        multiplier: safeMultiplier,
        roundId: currentRoundId,
      });

      // crash
      if (safeMultiplier >= crashPoint) {
        clearInterval(gameLoop);

        await crashGame(safeMultiplier);
      }
    } catch (err) {
      console.error("🔥 GAME LOOP ERROR:", err.message);

      clearInterval(gameLoop);

      setTimeout(startWaitingPhase, 3000);
    }
  }, 100);
}

// ======================================================
// CRASH GAME
// ======================================================

async function crashGame(crashValue) {
  try {
    setGameState("crashed");

    // save crash
    await pool.query("SELECT crash_game_round($1)", [currentRoundId]);

    // resolve bets
    await pool.query("SELECT resolve_lost_bets($1)", [currentRoundId]);

    // history
    history.unshift({
      id: currentRoundId,
      crashPoint: crashValue,
    });

    history = history.slice(0, 20);

    io.emit("game:crash", {
      multiplier: crashValue,
      roundId: currentRoundId,
    });

    // restart after 3 sec
    setTimeout(() => {
      if (activeUsers > 0) {
        startWaitingPhase();
      } else {
        gameStarted = false;
      }
    }, 3000);
  } catch (err) {
    console.error("🔥 CRASH ERROR:", err.message);

    setTimeout(startWaitingPhase, 3000);
  }
}

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
