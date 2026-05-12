import { useEffect, useState } from "react";
import { usePool } from "../hooks/usePool";

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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Main Prize Header */}
      <div className="relative bg-panel p-8 rounded-[2rem] border border-white/5 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-primary shadow-[0_0_20px_#4ADE80]" />
        
        <p className="text-xs text-primary font-bold tracking-[0.2em] uppercase mb-2">Current Prize Pool</p>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
          {pool.reward} <span className="text-primary">COINS</span>
        </h1>
        
        <div className="inline-flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-white/5">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-xs font-medium text-gray-300">LIVE POOL</span>
        </div>
      </div>

      {/* Countdown and Stats Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Ends In</p>
          <p className="text-2xl font-mono font-bold text-accent">{remaining}</p>
        </div>
        
        <div className="bg-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Participants</p>
          <p className="text-2xl font-bold text-white">{pool.participants_count || 0}</p>
        </div>
      </div>

      {/* Join Action */}
      {isActive && (
        <div className="bg-surface/30 p-4 rounded-2xl border border-dashed border-white/10 flex flex-col gap-4">
          <p className="text-center text-sm text-gray-400">Join now for a chance to win the weekly jackpot!</p>
          <button 
            onClick={join}
            className="w-full bg-primary hover:bg-primary/90 text-background font-black py-4 rounded-xl text-lg transition-all active:scale-95 shadow-[0_10px_20px_rgba(74,222,128,0.2)]"
          >
            {loading ? "PROCESSING..." : "JOIN POOL"}
          </button>
        </div>
      )}

      {/* Previous Winner Card (if exists) */}
      {pool.winner_name && (
        <div className="bg-accent/10 p-6 rounded-2xl border border-accent/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-accent font-black uppercase">Recent Winner</p>
            <p className="text-lg font-bold text-white">{pool.winner_name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-accent">🎉</p>
          </div>
        </div>
      )}
    </div>
  );
};