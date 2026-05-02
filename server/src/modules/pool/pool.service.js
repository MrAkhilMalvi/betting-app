import pool from "../../config/db.js";

export const getActivePool = async () => {
  const result = await pool.query(
    `SELECT 
        id,
        name,
        entry_fee,
        total_pool,
        end_at,
        status
     FROM pools
     WHERE status='active'
     ORDER BY created_at DESC
     LIMIT 1`
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

export const drawWinner = async (poolId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔒 1. Lock pool
    const poolRes = await client.query(
      `SELECT * FROM pools 
       WHERE id=$1 AND status='active'
       FOR UPDATE`,
      [poolId]
    );

    const poolData = poolRes.rows[0];

    if (!poolData) {
      throw new Error("POOL_NOT_FOUND_OR_ALREADY_ENDED");
    }

    // ⏱️ 2. Prevent early draw
    if (new Date(poolData.end_at) > new Date()) {
      throw new Error("POOL_NOT_ENDED_YET");
    }

    // 🎟️ 3. Get entries
    const entriesRes = await client.query(
      `SELECT user_id FROM pool_entries WHERE pool_id=$1`,
      [poolId]
    );

    const entries = entriesRes.rows;

    if (entries.length === 0) {
      // No entries → just close pool safely
      await client.query(
        `UPDATE pools SET status='ended' WHERE id=$1`,
        [poolId]
      );

      await client.query("COMMIT");

      return { message: "No entries, pool closed" };
    }

    // 🎲 4. Pick winner
    const winner =
      entries[Math.floor(Math.random() * entries.length)];

    const reward = Math.floor(poolData.total_pool * 0.8); // 80%

    // 💰 5. Credit wallet
    await client.query(
      `UPDATE wallets 
       SET balance = balance + $1 
       WHERE user_id=$2`,
      [reward, winner.user_id]
    );

    // 🧾 6. Log transaction
    await client.query(
      `INSERT INTO transactions (user_id, amount, type, reference_id)
       VALUES ($1,$2,'pool_reward',$3)`,
      [winner.user_id, reward, poolId]
    );

    // 🏆 7. Store winner in pool
    await client.query(
      `UPDATE pools 
       SET status='ended',
           winner_id=$1,
           reward=$2
       WHERE id=$3`,
      [winner.user_id, reward, poolId]
    );

    await client.query("COMMIT");

    return {
      winner: winner.user_id,
      reward,
    };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};