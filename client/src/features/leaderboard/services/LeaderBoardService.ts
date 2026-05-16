import axios from "@/providers/axios";
import { API_ENDPOINTS } from "@/providers/api-config";

export const getWeeklyLeaderboard = async (
  limit: number = 10
) => {
  try {
    const res = await axios.get(
      `${API_ENDPOINTS.LEADERBOARD.WEEKLY}?limit=${limit}`
    );

    return res.data;
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);

    throw new Error(
      error?.response?.data?.message ||
        "Failed to fetch leaderboard"
    );
  }
};