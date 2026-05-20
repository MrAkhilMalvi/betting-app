export interface Pool {
  id: string;
  name: string;
  entry_fee: number;
  total_pool: number;
  total_players: number;
  start_at: string;
  lock_at: string;
  end_at: string;
  status: "upcoming" | "active" | "locked" | "drawing" | "completed";
  winner_id?: string | null;
  reward: number;
  created_at: string;
}
