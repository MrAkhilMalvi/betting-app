import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import socketAuth from "./config/socket/socket.auth.js";
import { setIO } from "./config/socket/socket.js";
import redis from "./config/redis.js";
import { setupSocketHandlers } from "./config/socket/socket.handlers.js";
import { startWaitingPhase } from "./game/game.engine.js";
import { setGameState } from "./game/game.state.js";
import { startPoolListener } from "./modules/pool/events/pool.listner.js";
import { startPoolLifecycle } from "./modules/pool/scheduler/pool.lifecycle.js";
import { startPoolScheduler } from "./modules/pool/scheduler/pool.scheduler.js";



const server = http.createServer(app);



const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
  transports: ["websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
});


setIO(io);

io.use(socketAuth);

setupSocketHandlers(io);

(async () => {
  const running = await redis.get("game:running");

  if (!running) {
    await redis.set("game:running", "true");

    startWaitingPhase();
  }
})();


const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Server running on ${PORT}`);

  const exists = await redis.exists("game:current");

  if (!exists) {
    await setGameState({
      state: "waiting",
      multiplier: 1,
    });
  }

  await startPoolListener();
  startPoolLifecycle();
  startPoolScheduler();

  console.log("🎯 Pool systems started");
});
