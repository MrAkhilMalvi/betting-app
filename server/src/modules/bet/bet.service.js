import pool from "../../config/db.js";
import { gameState, currentRoundId } from "../../game/game.state.js";
import { getIO } from "../../config/socket/socket.js";

// 🎯 PLACE BET (UNCHANGED – already good)
export const placeBet = async (userId, amount) => {
  if (!amount || amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  if (gameState !== "waiting") {
    throw new Error("BET_CLOSED");
  }

  if (!currentRoundId) {
    throw new Error("NO_ACTIVE_ROUND");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔒 Lock wallet row
    const walletRes = await client.query(
      "SELECT balance FROM wallets WHERE user_id=$1 FOR UPDATE",
      [userId],
    );

    const wallet = walletRes.rows[0];

    if (!wallet || wallet.balance < amount) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    // 🚫 Prevent duplicate bet
    const existingBet = await client.query(
      `SELECT id FROM bets 
       WHERE user_id=$1 AND round_id=$2`,
      [userId, currentRoundId],
    );

    if (existingBet.rows.length) {
      throw new Error("BET_ALREADY_EXISTS");
    }

    // 💰 Deduct balance
    await client.query(
      `UPDATE wallets 
       SET balance = balance - $1 
       WHERE user_id=$2`,
      [amount, userId],
    );

    // 🎲 Insert bet
    const betRes = await client.query(
      `INSERT INTO bets(user_id, amount, round_id, status)
       VALUES($1,$2,$3,'pending')
       RETURNING *`,
      [userId, amount, currentRoundId],
    );

    // after COMMIT
    await client.query("COMMIT");

    const bet = betRes.rows[0];

    // ✅ EMIT LIVE BET
    try {
      const io = getIO();

      io.emit("bet:new", {
        id: bet.id,
        userId: bet.user_id,
        amount: bet.amount,
        status: "pending",
      });
    } catch (e) {
      console.log("Socket emit failed (bet:new)");
    }

    return bet;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const resolveBet = async (betId, multiplier) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔒 Lock bet row
    const betRes = await client.query(
      "SELECT * FROM bets WHERE id=$1 FOR UPDATE",
      [betId],
    );

    const bet = betRes.rows[0];

    if (!bet) throw new Error("BET_NOT_FOUND");

    // ✅ If already processed → stop
    if (bet.status !== "pending") {
      throw new Error("BET_ALREADY_RESOLVED");
    }

    // ✅ Get round (only for existence, not strict check)
    const roundRes = await client.query(
      `SELECT status FROM game_rounds WHERE id=$1`,
      [bet.round_id],
    );

    const round = roundRes.rows[0];

    if (!round) {
      throw new Error("INVALID_ROUND");
    }

    // ⚠️ DO NOT block on crashed

    const payout = Number((bet.amount * multiplier).toFixed(2));

    // 💰 Add winnings
    await client.query(
      `UPDATE wallets 
       SET balance = balance + $1 
       WHERE user_id=$2`,
      [payout, bet.user_id],
    );

    // ✅ FINAL SAFE UPDATE
    const updateRes = await client.query(
      `UPDATE bets
       SET status='won',
           cashout_multiplier=$1,
           payout=$2
       WHERE id=$3 AND status='pending'
       RETURNING *`,
      [multiplier, payout, betId],
    );

    if (updateRes.rows.length === 0) {
      // 🔥 THIS means crash already marked it lost
      throw new Error("INVALID_ROUND");
    }

    await client.query("COMMIT");

    // ✅ EMIT CASHOUT
    try {
      const io = getIO();

      io.emit("bet:cashout", {
        betId: betId,
        multiplier,
        payout,
      });
    } catch (e) {
      console.log("Socket emit failed (bet:cashout)");
    }

    return { payout };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
