
import { Trophy, Crown,  TrendingUp, Star, Zap, Flame } from "lucide-react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { motion } from "framer-motion";
import { CoinIcon } from "@/components/ui/CoinIcon";

export const Leaderboard = () => {
  const { leaderboard, loading } = useLeaderboard();

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 space-y-4">
        <div className="h-40 w-full bg-white/5 rounded-[2.5rem] animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 w-full bg-white/5 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  // Separate the Elite Top 3
  const topThree = leaderboard.slice(0, 3);
  const challengers = leaderboard.slice(3);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 space-y-12 bg-[#0B0E14]">
      
      {/* HEADER SECTION */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-green-500/10 blur-[100px] -z-10 rounded-full" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-4">
          <Zap size={14} className="text-green-500 fill-green-500" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Global Rankings</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white italic uppercase tracking-tighter mb-2">
          Weekly <span className="text-green-500">Legends</span>
        </h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em]">Resets in 3 Days • 14:00 UTC</p>
      </div>

      {/* PODIUM SECTION (TOP 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {topThree.map((user, index) => {
          const isFirst = index === 0;
          const config = [
            { color: "text-yellow-400", border: "border-yellow-500/30", bg: "from-yellow-500/10", label: "Legend" },
            { color: "text-slate-300", border: "border-slate-400/30", bg: "from-slate-400/10", label: "Pro" },
            { color: "text-amber-600", border: "border-amber-700/30", bg: "from-amber-700/10", label: "Elite" }
          ][index];

          return (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group flex flex-col items-center p-8 rounded-[2.5rem] border bg-gradient-to-b ${config.bg} to-transparent ${config.border} ${isFirst ? 'md:-translate-y-8 order-1 md:order-2 scale-110 shadow-2xl shadow-yellow-500/10' : index === 1 ? 'order-2 md:order-1' : 'order-3'}`}
            >
              {isFirst && <Crown className="absolute -top-6 text-yellow-500 w-12 h-12 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" fill="currentColor" />}
              
              <div className="relative mb-6">
                 <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt="Avatar"
                    className={`w-20 h-20 rounded-3xl border-4 ${isFirst ? 'border-yellow-500' : 'border-white/10'} bg-[#151A22]`}
                  />
                  <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-xl ${isFirst ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}>
                    Rank {index + 1}
                  </div>
              </div>

              <h3 className="text-xl font-black text-white italic uppercase mb-1">{user.username}</h3>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${config.color}`}>{config.label}</p>

              <div className="w-full bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                 <span className="text-[9px] font-black text-gray-500 uppercase mb-1">Total Earned</span>
                 <div className="flex items-center gap-2">
                    <CoinIcon size={20} />
                    <span className="text-xl font-mono font-black text-white">{Number(user.balance).toLocaleString()}</span>
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CHALLENGERS LIST */}
      <div className="space-y-3">
        <div className="flex items-center gap-4 px-8 mb-4">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Challengers Pool</span>
            <div className="flex-1 h-[1px] bg-white/5" />
        </div>

        {challengers.map((user, index) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (index + 3) * 0.05 }}
            className="group flex items-center justify-between p-4 bg-[#151A22] hover:bg-[#1A1F29] border border-white/5 rounded-[1.5rem] transition-all hover:translate-x-2"
          >
            <div className="flex items-center gap-6">
              <span className="w-6 text-center font-mono font-black text-gray-600 italic">#{index + 4}</span>
              
              <div className="flex items-center gap-4">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl bg-[#0B0E14] border border-white/10"
                />
                <div>
                  <div className="font-black text-white italic text-lg leading-none mb-1 uppercase group-hover:text-green-500 transition-colors">
                    {user.username}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-700" />
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Rising Star</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                  <Flame size={12} className="text-orange-500" />
                  <span className="text-[10px] font-black text-gray-400">HOT</span>
               </div>
               
               <div className="flex items-center gap-3 bg-[#0B0E14] px-6 py-2.5 rounded-2xl border border-white/5 min-w-[140px] justify-end">
                  <CoinIcon size={16} />
                  <span className="font-mono font-black text-white italic">
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