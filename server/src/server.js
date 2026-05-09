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
import { startPoolListener } from "./modules/pool/pool.listner.js";
import {
  generateServerSeed,
  generateHash,
  calculateCrashPoint,
} from "./game/crash.logic.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// ✅ register globally
setIO(io);
startPoolListener(io);

// 🎮 LOCAL STATE
let multiplier = 1;
let crashPoint = 1;
let history = [];
let isRunning = false;

// 🔐 PROVABLY FAIR STATE
let currentServerSeed = null;
let currentHash = null;

// 🔌 SOCKET
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.emit("game:init", {
    multiplier,
    state: gameState,
    roundId: currentRoundId,
    history,
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ⏱ GAME LOOP
let waitDuration = 5000;
let waitStartTime = null;

setInterval(async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    // 🟡 WAITING PHASE
    if (gameState === "waiting") {
      if (!waitStartTime) waitStartTime = Date.now();

      const remaining = waitDuration - (Date.now() - waitStartTime);

      // 🔐 Generate next round seed + hash (only once)
      if (!currentServerSeed) {
        currentServerSeed = generateServerSeed();
        currentHash = generateHash(currentServerSeed);
      }

      io.emit("game:waiting", {
        remaining: Math.max(0, Math.ceil(remaining / 1000)),
        nextHash: currentHash, // 🔥 shown before round
      });

      // ⏱ START ROUND
      if (remaining <= 0) {
        setGameState("running");
        waitStartTime = null;

        multiplier = 1;

        const serverSeed = currentServerSeed;
        const hash = currentHash;

        // 🎲 Deterministic crash
        crashPoint = calculateCrashPoint(serverSeed);

        // 💾 Store in DB
        const res = await pool.query(
          "SELECT create_game_round($1,$2,$3) AS id",
          [crashPoint, hash, serverSeed],
        );

        setCurrentRound(res.rows[0].id);

        io.emit("game:start", {
          roundId: res.rows[0].id,
        });

        // 🔄 Reset next seed for future round
        currentServerSeed = null;
        currentHash = null;
      }
    }

    // 🟢 RUNNING PHASE
    if (gameState === "running") {
      multiplier += 0.03 + multiplier * 0.01;

      const safeMultiplier = Number(multiplier.toFixed(2));

      io.emit("game:update", {
        multiplier: safeMultiplier,
        roundId: currentRoundId,
      });

      // 🔴 CRASH
      if (multiplier >= crashPoint) {
        setGameState("crashed");

        const crashValue = Number(multiplier.toFixed(2));

        // ⚠️ Save seed BEFORE reset
        const seedRes = await pool.query("SELECT get_round_seed($1) AS salt", [
          currentRoundId,
        ]);

        const serverSeed = seedRes.rows[0]?.salt;

        await pool.query("SELECT crash_game_round($1)", [currentRoundId]);

        history.unshift({
          id: currentRoundId,
          crashPoint: crashValue,
        });
        history = history.slice(0, 20);

        io.emit("game:crash", {
          multiplier: crashValue,
          roundId: currentRoundId,
          serverSeed: serverSeed, // 🔥 reveal for verification
        });

        // ✅ GRACE WINDOW (important)
        setTimeout(async () => {
          await pool.query("SELECT resolve_lost_bets($1)", [currentRoundId]);
        }, 300);

        // ⏱ RESET
        setTimeout(() => {
          setGameState("waiting");
          multiplier = 1;
        }, 3000);
      }
    }
  } catch (err) {
    console.error("🔥 GAME LOOP ERROR:", err.message);
  } finally {
    isRunning = false;
  }
}, 100);

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
