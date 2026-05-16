import { useEffect, useState } from "react";
import { getWeeklyLeaderboard } from "../services/LeaderBoardService";
import { LeaderboardUser } from "../types/leaderboard";

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getWeeklyLeaderboard();

        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    loading,
  };
};