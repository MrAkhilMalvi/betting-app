export interface Pool {
  id: string;
  name: string;
  entry_fee: number;
  total_pool: number;
  end_at: string;
  status: "active" | "ended";
  winner_name: string;
  reward: string | number;
}