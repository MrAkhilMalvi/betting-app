import pool from "../../config/db.js";
import redis from "../../config/redis.js";
import { getIO } from "../../config/socket/socket.js";

export const placeBet = async (userId, amount) => {
  try {
    // validate amount
    if (!amount || Number(amount) <= 0) {
      throw new Error("INVALID_AMOUNT");
    }

    // get live game state
    const game = await redis.hgetall("game:current");

    if (!game?.state) {
      throw new Error("GAME_STATE_MISSING");
    }

    // only during waiting phase
    if (game.state !== "waiting") {
      throw new Error("BET_CLOSED");
    }

    if (!game.roundId) {
      throw new Error("NO_ACTIVE_ROUND");
    }

    const existingBet = await redis.hgetall(`bet:${userId}`);

    if (existingBet && existingBet.status === "ACTIVE") {
      const pendingBet = await pool.query(
        `
        SELECT id
        FROM bets
        WHERE user_id = $1
        AND status = 'pending'
        LIMIT 1
        `,
        [userId],
      );

      // real active bet
      if (pendingBet.rows.length) {
        throw new Error("ACTIVE_BET_EXISTS");
      }

      // stale redis cleanup
      await redis.del(`bet:${userId}`);

      console.log("🧹 Removed stale Redis bet cache:", userId);
    }

    const result = await pool.query(
      `
      SELECT *
      FROM place_bet(
        $1,
        $2,
        $3
      )
      `,
      [userId, amount, game.roundId],
    );

    if (!result.rows.length) {
      throw new Error("BET_FAILED");
    }

    const bet = result.rows[0];

    // get updated wallet balance
    const walletRes = await pool.query(
      `
      SELECT balance
      FROM wallets
      WHERE user_id = $1
      `,
      [userId],
    );

    const balance = walletRes.rows[0]?.balance || 0;

    const pipeline = redis.multi();

    // active bet cache
    pipeline.hmset(`bet:${userId}`, {
      id: bet.id,
      userId,
      roundId: game.roundId,
      amount: bet.amount,
      status: "ACTIVE",
    });

    // safety ttl
    pipeline.expire(`bet:${userId}`, 300);

    // round tracking
    pipeline.sadd(`round:${game.roundId}:bets`, userId);
    pipeline.expire(`round:${game.roundId}:bets`, 3600);

    await pipeline.exec();

    console.log("🎲 BET TRACKED:", `round:${game.roundId}:bets`, userId);

    const io = getIO();

    // public event
    io.emit("bet:new", {
      id: bet.id,
      userId: bet.user_id,
      amount: bet.amount,
      status: bet.status,
      roundId: game.roundId,
    });

    // private wallet sync
    io.to(userId).emit("wallet:update", {
      balance,
    });

    return bet;
  } catch (err) {
    console.error("🔥 PLACE BET ERROR:", {
      message: err.message,
      stack: err.stack,
    });

    throw err;
  }
};

export const resolveBet = async (betId, multiplier) => {
  try {
    if (!betId) {
      throw new Error("BET_ID_REQUIRED");
    }

    if (!multiplier || Number(multiplier) <= 0) {
      throw new Error("INVALID_MULTIPLIER");
    }

    const result = await pool.query(
      `
      SELECT *
      FROM resolve_bet(
        $1,
        $2
      )
      `,
      [betId, multiplier],
    );

    if (!result.rows.length) {
      throw new Error("BET_RESOLVE_FAILED");
    }

    const resolvedBet = result.rows[0];

    // get updated wallet balance
    const walletRes = await pool.query(
      `
      SELECT balance
      FROM wallets
      WHERE user_id = $1
      `,
      [resolvedBet.user_id],
    );

    const balance = walletRes.rows[0]?.balance || 0;

    const pipeline = redis.multi();

    // remove active bet
    pipeline.del(`bet:${resolvedBet.user_id}`);

    // remove round tracking
    if (resolvedBet.round_id) {
      pipeline.srem(
        `round:${resolvedBet.round_id}:bets`,
        resolvedBet.user_id,
      );
    }

    await pipeline.exec();

    const io = getIO();

    // public cashout event
    io.emit("bet:cashout", {
      betId: resolvedBet.bet_id,
      userId: resolvedBet.user_id,
      multiplier,
      payout: resolvedBet.payout,
    });

    // private wallet sync
    io.to(resolvedBet.user_id).emit("wallet:update", {
      balance,
    });

    return {
      payout: resolvedBet.payout,
    };
  } catch (err) {
    console.error("🔥 CASHOUT ERROR:", {
      message: err.message,
      stack: err.stack,
    });

    throw err;
  }
};

export const cleanupRoundBets = async (roundId) => {
  try {
    console.log("🧹 CLEANUP ROUND:", roundId);

    // get all users
    const users = await redis.smembers(`round:${roundId}:bets`);

    console.log("👥 ROUND USERS:", users);

    if (!users.length) {
      console.log("⚠️ No users found for cleanup");

      return;
    }

    const pipeline = redis.multi();

    // delete all active bets
    for (const userId of users) {
      console.log("❌ DELETE:", `bet:${userId}`);

      pipeline.del(`bet:${userId}`);
    }

    // remove round set
    pipeline.del(`round:${roundId}:bets`);

    await pipeline.exec();

    console.log(`✅ Round cleanup complete: ${roundId}`);
  } catch (err) {
    console.error("🔥 CLEANUP ERROR:", {
      message: err.message,
      stack: err.stack,
    });
  }
};