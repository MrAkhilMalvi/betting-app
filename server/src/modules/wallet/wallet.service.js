import pool from "../../config/db.js";

export const getWallet = async (userId) => {
  const res = await pool.query(
    "SELECT balance FROM wallets WHERE user_id=$1",
    [userId]
  );

  return Number(res.rows[0].balance);
};

export const updateBalance = async (userId, amount, type) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const walletRes = await client.query(
      "SELECT balance FROM wallets WHERE user_id=$1 FOR UPDATE",
      [userId]
    );

    const balance = Number(walletRes.rows[0].balance);

    if (balance + amount < 0) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    const newBalance = balance + amount;

    await client.query(
      "UPDATE wallets SET balance=$1 WHERE user_id=$2",
      [newBalance, userId]
    );

    await client.query(
      `INSERT INTO transactions(user_id, amount, type, status)
       VALUES($1,$2,$3,'success')`,
      [userId, amount, type]
    );

    await client.query("COMMIT");

    return newBalance;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};