import pool from "../../config/db.js";

export const getWeeklyLeaderboard = async (limit = 10) => {
  const result = await pool.query(
    "SELECT * FROM get_weekly_leaderboard($1)",
    [limit]
  );

  return result.rows;
};