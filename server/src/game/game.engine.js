import pool from "../config/db.js";
import redis from "../config/redis.js";
import { getIO } from "../config/socket/socket.js";
import { cleanupRoundBets } from "../modules/bet/bet.service.js";

import {
  generateServerSeed,
  generateHash,
  calculateCrashPoint,
} from "./crash.logic.js";

import { getGameState, setGameState } from "./game.state.js";

let gameLoop = null;
let waitingTimer = null;

export async function startWaitingPhase() {
  try {
    console.log("⏳ WAITING PHASE");

    const io = getIO();

    const serverSeed = generateServerSeed();

    const nextHash = generateHash(serverSeed);

    // generate crash point NOW
    const crashPoint = calculateCrashPoint(serverSeed);

    // create round NOW
    const res = await pool.query(
      `
        SELECT create_game_round(
          $1,
          $2,
          $3
        ) AS id
        `,
      [crashPoint, nextHash, serverSeed],
    );

    const roundId = res.rows[0].id;

    // set waiting state
    await setGameState({
      state: "waiting",
      multiplier: 1,
      nextHash,
      serverSeed,
      crashPoint,
      roundId,
    });

    let remaining = 5;

    io.emit("game:waiting", {
      remaining,
      nextHash,
      roundId,
    });

    waitingTimer = setInterval(async () => {
      remaining--;

      io.emit("game:waiting", {
        remaining,
        nextHash,
        roundId,
      });

      if (remaining <= 0) {
        clearInterval(waitingTimer);

        startRound();
      }
    }, 1000);
  } catch (err) {
    console.error("🔥 WAITING ERROR:", err.message);

    setTimeout(startWaitingPhase, 3000);
  }
}

async function startRound() {
  try {
    console.log("🚀 ROUND STARTED");

    const io = getIO();

    const game = await getGameState();

    await setGameState({
      state: "running",
      multiplier: 1,
    });

    io.emit("game:start", {
      roundId: game.roundId,
    });

    runGameLoop();
  } catch (err) {
    console.error("🔥 START ROUND ERROR:", err.message);

    setTimeout(startWaitingPhase, 3000);
  }
}

async function runGameLoop() {
  const io = getIO();

  gameLoop = setInterval(async () => {
    try {
      const game = await getGameState();
      let multiplier =
        Number(game.multiplier) + 0.03 + Number(game.multiplier) * 0.01;

      multiplier = Number(multiplier.toFixed(2));

      await redis.hset("game:current", "multiplier", multiplier);

      io.emit("game:update", {
        multiplier,
        roundId: game.roundId,
      });

      if (multiplier >= game.crashPoint) {
        clearInterval(gameLoop);

        await crashGame(multiplier);
      }
    } catch (err) {
      console.error("🔥 LOOP ERROR:", err.message);
      clearInterval(gameLoop);
      setTimeout(startWaitingPhase, 3000);
    }
  }, 100);
}

async function crashGame(crashValue) {
  try {
    console.log("💥 GAME CRASHED");

    const io = getIO();

    const game = await getGameState();

    await pool.query(`SELECT crash_game_round($1)`, [game.roundId]);

    await pool.query(`SELECT resolve_lost_bets($1)`, [game.roundId]);
    await cleanupRoundBets(game.roundId);

    await redis.lpush(
      "game:history",
      JSON.stringify({
        id: game.roundId,
        crashPoint: crashValue,
      }),
    );

    await redis.ltrim("game:history", 0, 19);

    await setGameState({
      state: "crashed",
      multiplier: crashValue,
    });

    io.emit("game:crash", {
      multiplier: crashValue,
      roundId: game.roundId,
    });

    setTimeout(() => {
      startWaitingPhase();
    }, 3000);
  } catch (err) {
    console.error("🔥 CRASH ERROR:", err.message);

    setTimeout(startWaitingPhase, 3000);
  }
}
