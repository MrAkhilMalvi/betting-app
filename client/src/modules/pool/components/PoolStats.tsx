import { formatCoins, formatDate } from "../utils/pool.utils";

export const PoolStats = ({ pool }: any) => (
  <div className="grid grid-cols-3 gap-3 mt-4 text-center">

    <div className="bg-[#0a0f16] p-3 rounded">
      <p className="text-xs text-gray-400">Entry</p>
      <p className="text-white">{formatCoins(pool.entry_fee)}</p>
    </div>

    <div className="bg-[#0a0f16] p-3 rounded">
      <p className="text-xs text-gray-400">Pool</p>
      <p className="text-green-400">{formatCoins(pool.total_pool)}</p>
    </div>

    <div className="bg-[#0a0f16] p-3 rounded">
      <p className="text-xs text-gray-400">Ends</p>
      <p className="text-white">{formatDate(pool.end_at)}</p>
    </div>

  </div>
);