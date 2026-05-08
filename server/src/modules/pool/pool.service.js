import pool from "../../config/db.js";

export const getActivePool = async () => {
  const result = await pool.query(
    `
    SELECT 
        p.id,
        p.name,
        p.entry_fee,
        p.total_pool,
        p.end_at,
        p.status,
        p.winner_id,
        p.reward,
        u.username AS winner_name
    FROM pools p
    LEFT JOIN users u
      ON u.id = p.winner_id
    WHERE p.status IN ('active', 'ended')
    ORDER BY p.created_at DESC
    LIMIT 1
    `
  );

  return result.rows[0] || null;
};
// 🎯 JOIN POOL (SAFE + TRANSACTIONAL)
export const joinPool = async (userId, poolId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔒 1. Get pool (lock row)
    const poolRes = await client.query(
      `SELECT * FROM pools 
       WHERE id=$1 AND status='active'
       FOR UPDATE`,
      [poolId]
    );

    const poolData = poolRes.rows[0];

    if (!poolData) {
      throw new Error("POOL_NOT_ACTIVE");
    }

    // 🔒 2. Lock wallet
    const walletRes = await client.query(
      `SELECT balance FROM wallets 
       WHERE user_id=$1 
       FOR UPDATE`,
      [userId]
    );

    const wallet = walletRes.rows[0];

    if (!wallet) {
      throw new Error("WALLET_NOT_FOUND");
    }

    // ❌ Check balance
    if (wallet.balance < poolData.entry_fee) {
      throw new Error("INSUFFICIENT_COINS");
    }

    // 🚫 Prevent duplicate entry
    const existingEntry = await client.query(
      `SELECT id FROM pool_entries 
       WHERE user_id=$1 AND pool_id=$2`,
      [userId, poolId]
    );

    if (existingEntry.rows.length) {
      throw new Error("ALREADY_JOINED");
    }

    // 💰 Deduct coins
    await client.query(
      `UPDATE wallets 
       SET balance = balance - $1 
       WHERE user_id=$2`,
      [poolData.entry_fee, userId]
    );

    // 🧾 Log transaction
    await client.query(
      `INSERT INTO transactions (user_id, amount, type)
       VALUES ($1,$2,'pool_entry')`,
      [userId, poolData.entry_fee]
    );

    // 🎟️ Create entry
    await client.query(
      `INSERT INTO pool_entries (pool_id, user_id)
       VALUES ($1,$2)`,
      [poolId, userId]
    );

    // 📈 Update pool amount
    await client.query(
      `UPDATE pools 
       SET total_pool = total_pool + $1 
       WHERE id=$2`,
      [poolData.entry_fee, poolId]
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Joined pool successfully",
    };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const createPool = async (data) => {
  const {
    name,
    entry_fee,
    start_at,
    end_at,
  } = data;

  const result = await pool.query(
    `INSERT INTO pools (name, type, entry_fee, status, start_at, end_at)
     VALUES ($1, 'lucky_draw', $2, 'active', $3, $4)
     RETURNING *`,
    [name, entry_fee, start_at, end_at]
  );

  return result.rows[0];
};

