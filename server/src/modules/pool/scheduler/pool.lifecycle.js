import pool from "../../../config/db.js";

export const processPools = async () => {
  try {
    await pool.query(`
        SELECT process_pool_lifecycle()
      `);
  } catch (err) {
    console.error("processPools error:", err);
  }
};

export const startPoolLifecycle = () => {
  console.log("🧠 Pool lifecycle started");

  setInterval(async () => {
    await processPools();
  }, 1000);
};
