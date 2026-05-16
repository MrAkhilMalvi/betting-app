import redis from "../config/redis.js";

export async function getGameState() {
  const game = await redis.hgetall("game:current");

  return {
    multiplier: Number(game.multiplier || 1),
    state: game.state || "waiting",
    roundId: game.roundId || null,
    crashPoint: Number(game.crashPoint || 1),
    nextHash: game.nextHash || null,
    serverSeed: game.serverSeed || null,
  };
}

export async function setGameState(data) {
  await redis.hmset("game:current", data);
}

export async function getHistory() {
  const history = await redis.lrange("game:history", 0, 19);

  return history.map((item) => JSON.parse(item));
}
