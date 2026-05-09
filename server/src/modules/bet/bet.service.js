import pool from "../../config/db.js";
import { gameState, currentRoundId } from "../../game/game.state.js";
import { getIO } from "../../config/socket/socket.js";

export const placeBet = async (userId, amount) => {
  if (gameState !== "waiting") {
    throw new Error("BET_CLOSED");
  }

  if (!currentRoundId) {
    throw new Error("NO_ACTIVE_ROUND");
  }

  const result = await pool.query("SELECT * FROM place_bet($1,$2,$3)", [
    userId,
    amount,
    currentRoundId,
  ]);

  const bet = result.rows[0];

  // socket stays in node
  try {
    const io = getIO();

    io.emit("bet:new", {
      id: bet.id,
      userId: bet.user_id,
      amount: bet.amount,
      status: bet.status,
    });
  } catch (e) {
    console.log("Socket emit failed");
  }

  return bet;
};
export const resolveBet = async (betId, multiplier) => {
  const result = await pool.query("SELECT * FROM resolve_bet($1,$2)", [
    betId,
    multiplier,
  ]);

  const payout = result.rows[0].payout;

  try {
    const io = getIO();

    io.emit("bet:cashout", {
      betId,
      multiplier,
      payout,
    });
  } catch (e) {
    console.log("Socket emit failed");
  }

  return { payout };
};
