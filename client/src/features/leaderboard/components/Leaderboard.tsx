import { Trophy, Crown, Zap, Flame, Star } from "lucide-react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { motion } from "framer-motion";
import { CoinIcon } from "@/components/ui/CoinIcon";
import { clsx } from "clsx";

export const Leaderboard = () => {
  const { leaderboard, loading } = useLeaderboard();

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="h-40 w-full bg-panel rounded-[1.5rem] sm:rounded-[2.5rem] animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 sm:h-20 w-full bg-panel animate-pulse rounded-xl sm:rounded-2xl" />
        ))}
      </div>
    );
  }

  // Separate the Elite Top 3
  const topThree = leaderboard.slice(0, 3);
  const challengers = leaderboard.slice(3);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 space-y-12 bg-background min-h-screen text-white">
      
      {/* HEADER SECTION */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10 rounded-full" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface/80 border border-white/10 rounded-full mb-4 glass-card">
          <Zap size={14} className="text-primary fill-primary animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Global Rankings</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white italic uppercase tracking-tighter mb-2">
          Weekly <span className="text-primary text-glow-primary">Legends</span>
        </h1>
        <p className="text-gray-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.4em]">Resets in 3 Days • 14:00 UTC</p>
      </div>

      {/* PODIUM SECTION (TOP 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 md:pt-12">
        {topThree.map((user, index) => {
          const isFirst = index === 0;
          const config = [
            { color: "text-amber-400", border: "border-amber-500/20", bg: "from-amber-500/10", label: "Legend" },
            { color: "text-slate-300", border: "border-slate-400/20", bg: "from-slate-400/10", label: "Pro" },
            { color: "text-orange-500", border: "border-orange-500/20", bg: "from-orange-500/10", label: "Elite" }
          ][index];

          return (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={clsx(
                "relative group flex flex-col items-center p-6 sm:p-8 rounded-[2rem] border bg-gradient-to-b to-panel/40",
                config.bg,
                config.border,
                // Order layout: Mobile is 1 -> 2 -> 3; Desktop is 2 -> 1 -> 3
                isFirst ? "order-1 md:order-2 md:-translate-y-6 md:scale-105 shadow-2xl shadow-primary/5 border-primary/30" : index === 1 ? "order-2 md:order-1" : "order-3"
              )}
            >
              {isFirst && (
                <Crown className="absolute -top-7 text-amber-500 w-12 h-12 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" fill="currentColor" />
              )}
              
              <div className="relative mb-5">
                 <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt="Avatar"
                    className={clsx(
                      "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl border-4 bg-panel",
                      isFirst ? "border-primary" : "border-white/10"
                    )}
                  />
                  <div className={clsx(
                    "absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-tighter shadow-xl whitespace-nowrap",
                    isFirst ? "bg-primary text-background" : "bg-surface border border-white/5 text-white"
                  )}>
                    Rank {index + 1}
                  </div>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white italic uppercase mb-0.5 truncate max-w-[200px]">{user.username}</h3>
              <p className={clsx("text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-5", config.color)}>{config.label}</p>

              <div className="w-full bg-background border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center shadow-inner">
                 <span className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase mb-1">Total Earned</span>
                 <div className="flex items-center gap-2">
                    <CoinIcon size={16} />
                    <span className="text-base sm:text-lg font-mono font-black text-white">{Number(user.balance).toLocaleString()}</span>
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CHALLENGERS LIST */}
      <div className="space-y-3">
        <div className="flex items-center gap-4 px-4 sm:px-8 mb-4">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Challengers Pool</span>
            <div className="flex-1 h-[1px] bg-white/5" />
        </div>

        {challengers.map((user, index) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (index + 3) * 0.05 }}
            className="group flex items-center justify-between p-3.5 sm:p-4 bg-panel hover:bg-surface border border-white/5 rounded-xl sm:rounded-[1.5rem] transition-all hover:translate-x-1 sm:hover:translate-x-2"
          >
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              <span className="w-6 text-center font-mono font-black text-gray-600 italic text-xs sm:text-sm">#{index + 4}</span>
              
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt="Avatar"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-background border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-black text-white italic text-base sm:text-lg leading-none mb-1 uppercase group-hover:text-primary transition-colors truncate">
                    {user.username}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                    <span className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Rising Star</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
               <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                  <Flame size={12} className="text-orange-500 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-400 uppercase">HOT</span>
               </div>
               
               <div className="flex items-center gap-2 sm:gap-3 bg-background px-4 sm:px-6 py-2 rounded-lg sm:rounded-2xl border border-white/5 min-w-[110px] sm:min-w-[140px] justify-end">
                  <CoinIcon size={14} />
                  <span className="font-mono text-sm sm:text-base font-black text-white italic">
                    {Number(user.balance || 0).toLocaleString()}
                  </span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};