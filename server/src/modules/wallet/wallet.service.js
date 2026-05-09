import pool from "../../config/db.js";

export const getWallet = async (userId) => {
  const result = await pool.query("SELECT get_wallet($1) AS balance", [userId]);

  return Number(result.rows[0].balance || 0);
};

export const updateBalance = async (userId, amount, type) => {
  const result = await pool.query(
    "SELECT update_balance($1,$2,$3) AS balance",
    [userId, amount, type],
  );

  return Number(result.rows[0].balance);
};
