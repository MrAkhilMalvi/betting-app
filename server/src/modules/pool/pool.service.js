import pool from "../../config/db.js";

export const getActivePool = async () => {
  try {
    const result = await pool.query(`
      SELECT * FROM get_active_pool()
    `);

    return result.rows[0] || null;
  } catch (err) {
    console.error("getActivePool error:", err);

    throw err;
  }
};

export const joinPool = async (userId, poolId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT join_pool($1, $2)
      `,
      [userId, poolId],
    );

    await client.query("COMMIT");

    return {
      success: true,
      data: result.rows[0].join_pool,
    };
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("joinPool error:", err);

    throw err;
  } finally {
    client.release();
  }
};


export const createPool = async (data) => {
  const client = await pool.connect();

  try {
    const { name, entry_fee, start_at, end_at } = data;

    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT * FROM create_pool(
        $1,
        $2,
        $3,
        $4
      )
      `,
      [name, entry_fee, start_at, end_at],
    );

    await client.query("COMMIT");

    return {
      success: true,
      data: result.rows[0],
    };
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("createPool error:", err);

    throw err;
  } finally {
    client.release();
  }
};


export const createAutomaticPool = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(`
      SELECT * FROM create_scheduled_pool()
    `);

    await client.query("COMMIT");

    return {
      success: true,
      data: result.rows[0],
    };
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("createAutomaticPool error:", err);

    throw err;
  } finally {
    client.release();
  }
};


export const processPoolLifecycle = async () => {
  try {
    await pool.query(`
        SELECT process_pool_lifecycle()
      `);
  } catch (err) {
    console.error("processPoolLifecycle error:", err);

    throw err;
  }
};


export const getPoolHistory = async (limit = 10) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          name,
          entry_fee,
          total_pool,
          winner_id,
          status,
          created_at
        FROM pools
        WHERE status = 'completed'
        ORDER BY created_at DESC
        LIMIT $1
        `,
      [limit],
    );

    return result.rows;
  } catch (err) {
    console.error("getPoolHistory error:", err);

    throw err;
  }
};
