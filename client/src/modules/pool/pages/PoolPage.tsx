import { usePool } from "../hooks/usePool";
import { PoolCard } from "../components/PoolCard";
import { PoolStats } from "../components/PoolStats";
import { JoinPoolButton } from "../components/JoinButton";

export const PoolPage = () => {
  const { pool, loading, join } = usePool();

  if (!pool) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Loading pool...
      </div>
    );
  }

  const isActive = pool.status === "active";

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">

      {/* 🧩 HEADER */}
      <PoolCard title={pool.name} />

      {/* 📊 STATS */}
      <PoolStats pool={pool} />

      {/* 🔥 STATUS */}
      <div className="text-center text-xs text-gray-400">
        {isActive ? "🟢 Live Pool" : "🔴 Completed"}
      </div>

      {/* 🏆 WINNER */}
      {pool.winner_name && (
        <div className="bg-[#0a0f16] p-4 rounded-lg text-center border border-green-500/20">
          <p className="text-xs text-gray-400">Winner</p>

          <p className="text-lg font-bold text-green-400">
            {pool.winner_name}
          </p>

          <p className="text-sm text-white mt-1">
            Won {pool.reward} coins 🎉
          </p>
        </div>
      )}

      {/* 🎟 JOIN BUTTON */}
      {isActive && (
        <JoinPoolButton onClick={join} loading={loading} />
      )}

    </div>
  );
};