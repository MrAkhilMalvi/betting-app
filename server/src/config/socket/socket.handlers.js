import redis from "../redis.js";

import { getGameState, getHistory } from "../../game/game.state.js";
export function setupSocketHandlers(io) {
  io.on("connection", async (socket) => {
    console.log(`✅ Connected: ${socket.id}`);

    // JOIN PRIVATE USER ROOM
    socket.join(String(socket.user.id));

    console.log("🏠 Joined room:", socket.user.id);

    await redis.sadd(`user:${socket.user.id}:sockets`, socket.id);

    await redis.sadd("onlineUsers", socket.user.id);

    const onlineCount = await redis.scard("onlineUsers");

    console.log(`👥 Online users: ${onlineCount}`);

    const game = await getGameState();

    const history = await getHistory();

    socket.emit("game:init", {
      multiplier: game.multiplier,
      state: game.state,
      roundId: game.roundId,
      history,
    });

    socket.on("disconnect", async () => {
      console.log(`❌ Disconnected: ${socket.id}`);

      await redis.srem(`user:${socket.user.id}:sockets`, socket.id);

      const socketCount = await redis.scard(
        `user:${socket.user.id}:sockets`,
      );

      if (socketCount === 0) {
        await redis.srem("onlineUsers", socket.user.id);
      }

      const remaining = await redis.scard("onlineUsers");

      console.log(`👥 Online users: ${remaining}`);
    });
  });
}