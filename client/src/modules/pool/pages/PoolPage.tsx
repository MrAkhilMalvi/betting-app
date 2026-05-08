import { useEffect, useState } from "react";
import { usePool } from "../hooks/usePool";
import { PoolCard } from "../components/PoolCard";
import { PoolStats } from "../components/PoolStats";
import { JoinPoolButton } from "../components/JoinButton";

export const PoolPage = () => {

  const { pool, loading, join } = usePool();

  const [remaining, setRemaining] = useState("");

  // ⏱ Countdown
  useEffect(() => {

    if (!pool?.end_at) return;

    const interval = setInterval(() => {

      const end = new Date(pool.end_at).getTime();

      const now = Date.now();

      const diff = end - now;

      if (diff <= 0) {
        setRemaining("Pool ended");
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);

      const seconds = Math.floor((diff / 1000) % 60);

      setRemaining(
        `${minutes}m ${seconds}s`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [pool]);

  if (!pool) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Loading pool...
      </div>
    );
  }

  const isActive = pool.status === "active";

  // 📅 formatted end time
  const formattedEndTime =
    new Date(pool.end_at).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">

      {/* HEADER */}
      <PoolCard title={pool.name} />

      {/* STATS */}
      <PoolStats pool={pool} />

      {/* STATUS */}
      <div className="bg-[#0a0f16] p-4 rounded-lg border border-white/10">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs text-gray-400">
              Status
            </p>

            <p className="text-sm font-semibold text-white">
              {isActive
                ? "🟢 Live Pool"
                : "🔴 Completed"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">
              Ends At
            </p>

            <p className="text-sm text-white">
              {formattedEndTime}
            </p>
          </div>

        </div>

        {/* ⏱ Countdown */}
        {isActive && (
          <div className="mt-4 text-center">

            <p className="text-xs text-gray-400">
              Winner in
            </p>

            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {remaining}
            </p>

          </div>
        )}

      </div>

      {/* WINNER */}
      {pool.winner_name && (
        <div className="bg-[#0a0f16] p-4 rounded-lg text-center border border-green-500/20">

          <p className="text-xs text-gray-400">
            Winner
          </p>

          <p className="text-lg font-bold text-green-400">
            {pool.winner_name}
          </p>

          <p className="text-sm text-white mt-1">
            Won {pool.reward} coins 🎉
          </p>

        </div>
      )}

      {/* JOIN */}
      {isActive && (
        <JoinPoolButton
          onClick={join}
          loading={loading}
        />
      )}

    </div>
  );
};