import pool from "../../config/db.js";

export const getActivePool = async () => {
  const result = await pool.query("SELECT * FROM get_active_pool()");

  return result.rows[0] || null;
};

export const joinPool = async (userId, poolId) => {
  const result = await pool.query("SELECT join_pool($1,$2)", [userId, poolId]);

  return result.rows[0].join_pool;
};

export const createPool = async (data) => {
  const { name, entry_fee, start_at, end_at } = data;

  const result = await pool.query(
    `SELECT * FROM create_pool(
      $1,$2,$3,$4
    )`,
    [name, entry_fee, start_at, end_at],
  );

  return result.rows[0];
};
