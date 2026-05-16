import { getWeeklyLeaderboard } from "./leaderboard.service.js";

export const getWeeklyLeaderboardController = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const leaderboard = await getWeeklyLeaderboard(limit);

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
};