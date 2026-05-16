import { useEffect, useState } from "react";
import { usePool } from "../hooks/usePool";
import { Timer, Users, Trophy, Sparkles, Zap, Info } from "lucide-react";
import { motion } from "framer-motion";
import { CoinIcon } from "@/components/ui/CoinIcon";


export const PoolPage = () => {
  const { pool, loading, join } = usePool();
  const [remaining, setRemaining] = useState({ mins: "00", secs: "00" });

  useEffect(() => {
    if (!pool?.end_at) return;
    const interval = setInterval(() => {
      const end = new Date(pool.end_at).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setRemaining({ mins: "00", secs: "00" });
        clearInterval(interval);
        return;
      }

      const m = Math.floor(diff / 1000 / 60);
      const s = Math.floor((diff / 1000) % 60);
      
      setRemaining({
        mins: m.toString().padStart(2, '0'),
        secs: s.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pool]);

  if (!pool) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Syncing Jackpot...</p>
      </div>
    );
  }

  const isActive = pool.status === "active";

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-8 bg-[#0B0E14]">
      
      {/* 🏆 THE JACKPOT HERO */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-[#151A22] p-10 sm:p-16 rounded-[3rem] border border-white/5 overflow-hidden text-center shadow-2xl"
      >
        {/* Animated Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-500/10 blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-500/10 blur-[100px]" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">Weekly Grand Pool</span>
          </div>
          
          <h1 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter uppercase mb-2">
            {pool.reward.toLocaleString()}
          </h1>
          <div className="flex items-center justify-center gap-3 text-2xl font-black text-gray-500 italic uppercase">
            <CoinIcon size={32} /> COINS
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Pool Status</span>
          </div>
        </div>
      </motion.div>

      {/* 📊 STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Countdown Box */}
        <div className="bg-[#151A22] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center group">
          <div className="flex items-center gap-2 mb-4 text-gray-500 group-hover:text-green-500 transition-colors">
            <Timer size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Jackpot Ends In</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-4xl font-black text-white">
            <div className="bg-black/40 px-3 py-2 rounded-xl border border-white/5">{remaining.mins}</div>
            <span className="text-green-500 animate-pulse">:</span>
            <div className="bg-black/40 px-3 py-2 rounded-xl border border-white/5">{remaining.secs}</div>
          </div>
        </div>
        
        {/* Participants Box */}
        <div className="bg-[#151A22] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center group">
          <div className="flex items-center gap-2 mb-4 text-gray-500 group-hover:text-green-500 transition-colors">
            <Users size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Participants</span>
          </div>
          <p className="text-4xl font-black text-white italic">{pool.participants_count || 0}</p>
          <div className="mt-2 text-[10px] font-black text-gray-600 uppercase">Users Joined</div>
        </div>
      </div>

      {/* ⚡ JOIN ACTION */}
      {isActive && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1A1F29] p-8 rounded-[2.5rem] border border-green-500/10 shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
                <Zap size={18} className="text-yellow-500 fill-yellow-500" />
                <p className="text-xs font-bold text-gray-300">Entry fee: 10 Coins</p>
            </div>

            <button 
              onClick={join}
              disabled={loading}
              className="w-full max-w-sm bg-green-500 hover:bg-green-400 text-black font-black py-5 rounded-[1.5rem] text-xl transition-all active:scale-95 shadow-[0_15px_35px_rgba(34,197,94,0.3)] uppercase italic tracking-widest disabled:opacity-50 border-b-8 border-black/20"
            >
              {loading ? "Processing..." : "Join Jackpot Now"}
            </button>

            <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                <Info size={14} className="text-gray-400" />
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Winner is selected randomly when timer hits 0</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🏆 RECENT WINNER CARD */}
      {pool.winner_name && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-yellow-500/10 to-transparent p-6 rounded-[1.5rem] border border-yellow-500/20 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/30">
                <Trophy size={24} />
            </div>
            <div>
              <p className="text-[9px] text-yellow-500 font-black uppercase tracking-[0.2em] mb-1">Previous Champion</p>
              <p className="text-xl font-black text-white italic uppercase">{pool.winner_name}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Collected</span>
            <div className="flex items-center gap-2 justify-end">
                <CoinIcon size={16} />
                <span className="text-lg font-black text-white italic">12,500</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* FOOTER INFO */}
      <p className="text-center text-gray-600 text-[10px] uppercase tracking-[0.4em] font-black">
        Global Jackpot System • Provably Fair
      </p>
    </div>
  );
};