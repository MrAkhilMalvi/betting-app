import React, { useState } from "react";
import {
  History,
  Users,
  Wallet,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { GameGraph } from "@/components/common/GameGraph";
import { clsx } from "clsx";
import { placeBet, resolveBet } from "../services/BetService";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useGameSocket } from "../hooks/useGameSocket";
import { useGameStore } from "../store/betting.store";
import { CoinIcon } from "@/components/ui/CoinIcon";


export const RocketGame: React.FC = () => {
  useGameSocket();
  const {
    liveBets,
    history,
    isLoading,
    setLoading,
    hasBet,
    setHasBet,
    betId,
    setBetId,
    roundId,
    balance
  } = useGameStore();

  const [betAmount, setBetAmount] = useState<number>(10);
  const multiplier = useGameStore((s) => s.multiplier);
  const gameState = useGameStore((s) => s.gameState);
  const timeRemaining = useGameStore((s) => s.timeRemaining);

  const handleBetAction = async () => {
    if (isLoading) return;
    try {
      setLoading(true);
      if (gameState === "waiting" && !hasBet) {
        if (balance < betAmount) {
          toast.error("Insufficient Coins");
          return;
        }
        const res = await placeBet(betAmount);
        const id = res.bet?.id;
        if (!id) throw new Error("Invalid response");
        setBetId(id);
        setHasBet(true);
      } else if (gameState === "running" && hasBet && betId && multiplier > 1) {
        if (!roundId) return;
        await resolveBet(betId, multiplier);
        setHasBet(false);
        setBetId(null);
        toast.success(`Collected ${(betAmount * multiplier).toFixed(0)} Coins!`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg === "INVALID_ROUND") toast("💥 Crashed! Too late.");
      else toast.error(msg || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const getButtonProps = () => {
    if (isLoading) return { text: "SYNCING...", color: "bg-white/5 text-gray-500 border-white/5" };
    if (gameState === "waiting" && !hasBet) return { text: "PLACE BET", color: "bg-green-500 text-black hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]" };
    if (gameState === "waiting" && hasBet) return { text: "BET READY", color: "bg-orange-500/20 text-orange-500 border-orange-500/30" };
    if (gameState === "running" && hasBet) return { text: `CASHOUT`, color: "bg-yellow-500 text-black animate-pulse shadow-[0_0_40px_rgba(234,179,8,0.5)]" };
    if (gameState === "running" && !hasBet) return { text: "GAME LIVE", color: "bg-white/5 text-gray-600" };
    if (gameState === "crashed") return { text: "CRASHED", color: "bg-red-500/20 text-red-500" };
    return { text: "WAITING", color: "bg-white/5 text-gray-600" };
  };

  const btnProps = getButtonProps();
  const isDisabled = isLoading || gameState === "crashed" || (gameState === "running" && !hasBet);

  return (
    <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-8 max-w-[1600px] mx-auto w-full min-h-[calc(100vh-80px)] font-sans bg-[#0B0E14]">
      
      {/* LEFT: LIVE PLAYERS TAPE */}
      <aside className="lg:col-span-3 bg-[#151A22] rounded-[2rem] border border-white/5 flex flex-col shadow-2xl overflow-hidden order-3 lg:order-1">
        <div className="p-5 border-b border-white/5 bg-[#1A1F29]/50 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            <h2 className="font-black text-xs uppercase tracking-widest text-gray-300">Live Players</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-green-500">{liveBets.length}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {liveBets.map((bet) => (
              <div key={bet.id} className={clsx(
                "flex justify-between items-center p-3 rounded-2xl border transition-all duration-300",
                bet.status === "won" ? "bg-green-500/10 border-green-500/20" : "bg-[#0B0E14] border-white/5"
              )}>
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${bet.userId}`} alt="av" className="w-8 h-8 rounded-lg bg-white/5" />
                  <span className="text-xs font-bold text-gray-400">Player_{bet.userId}</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end text-[10px] font-mono text-gray-500">
                    <CoinIcon size={10}/> {bet.amount}
                  </div>
                  <span className={clsx("text-xs font-black italic uppercase", bet.status === "won" ? "text-green-400" : "text-yellow-500 animate-pulse")}>
                    {bet.status === "won" ? `${bet.multiplier?.toFixed(2)}x` : "LIVE"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </aside>

      {/* CENTER: THE COCKPIT */}
      <div className="lg:col-span-6 flex flex-col gap-6 order-1 lg:order-2">
        {/* VISUALIZER */}
        <div className="relative bg-[#151A22] rounded-[2.5rem] border border-white/5 flex-1 min-h-[450px] flex items-center justify-center shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 z-0 opacity-40">
            <GameGraph multiplier={multiplier} gameState={gameState} />
          </div>

          <div className="text-center z-10 pointer-events-none">
            {gameState === "waiting" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin mb-6" />
                <h3 className="text-xs font-black text-green-500 uppercase tracking-[0.5em] mb-2">Next Round In</h3>
                <span className="text-6xl font-black text-white italic">{timeRemaining}s</span>
              </motion.div>
            )}

            {gameState === "running" && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <span className="text-xs font-black text-green-500 uppercase tracking-[0.5em] block mb-2">Current Payout</span>
                <h1 className="text-9xl font-black text-white italic tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                  {multiplier.toFixed(2)}<span className="text-4xl text-gray-500">x</span>
                </h1>
              </motion.div>
            )}

            {gameState === "crashed" && (
              <motion.div initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
                <h1 className="text-9xl font-black text-red-500 italic tracking-tighter drop-shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                  {multiplier.toFixed(2)}<span className="text-4xl text-red-800">x</span>
                </h1>
                <span className="inline-block mt-4 px-6 py-2 bg-red-500 text-black text-xs font-black rounded-full uppercase italic">Rocket Crashed</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-[#151A22] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-[#0B0E14] rounded-3xl p-5 border border-white/5 focus-within:border-green-500/30 transition-all">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Bet Amount</label>
                <div className="flex items-center gap-3 mb-4">
                    <CoinIcon size={24} />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      disabled={hasBet || gameState === "running"}
                      className="bg-transparent outline-none text-3xl font-black text-white w-full italic"
                    />
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[10, 50, 100, "MAX"].map((val) => (
                      <button 
                        key={val} 
                        onClick={() => setBetAmount(val === "MAX" ? balance : Number(val))}
                        className="py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-gray-400 border border-white/5 transition-all"
                      >
                        {val === "MAX" ? val : `+${val}`}
                      </button>
                    ))}
                </div>
            </div>

            <button
              onClick={handleBetAction}
              disabled={isDisabled}
              className={clsx(
                "md:w-64 h-[120px] rounded-3xl font-black text-xl uppercase italic tracking-widest transition-all active:scale-95 flex flex-col items-center justify-center border-b-8 border-black/20",
                btnProps.color
              )}
            >
               {gameState === "running" && hasBet ? (
                 <>
                    <span className="text-[10px] opacity-60 mb-1">Take Coins</span>
                    <div className="flex items-center gap-2">
                        <CoinIcon size={20}/>
                        <span className="text-2xl">{(betAmount * multiplier).toFixed(0)}</span>
                    </div>
                 </>
               ) : (
                 btnProps.text
               )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: WALLET & HISTORY */}
      <aside className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-3">
        {/* WALLET */}
        <div className="bg-gradient-to-br from-[#1A1F29] to-[#151A22] rounded-[2rem] border border-white/5 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <Wallet size={64} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Account Balance</h3>
          <div className="flex items-center gap-3">
             <CoinIcon size={32} />
             <span className="text-4xl font-black text-white italic tracking-tighter">
                {balance.toLocaleString()}
             </span>
          </div>
          <div className="mt-6 flex items-center justify-between text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/5 p-3 rounded-xl border border-green-500/10">
             <ShieldCheck size={14}/> Verified Rocket Wallet
          </div>
        </div>

        {/* HISTORY TAPE */}
        <div className="bg-[#151A22] rounded-[2rem] border border-white/5 flex flex-col shadow-xl flex-1 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#1A1F29]/50">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-yellow-500" />
              <h2 className="font-black text-xs uppercase tracking-widest text-gray-300">Previous</h2>
            </div>
            <TrendingUp size={14} className="text-gray-600" />
          </div>

          <div className="p-4 grid grid-cols-3 gap-2 overflow-y-auto custom-scrollbar">
              {history.map((h) => (
                  <div key={h.id} className={clsx(
                    "px-2 py-3 rounded-xl text-[11px] font-black text-center border font-mono transition-all",
                    h.crashPoint >= 10 ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                    h.crashPoint >= 2 ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    "bg-[#0B0E14] text-gray-500 border-white/5"
                  )}>
                    {h.crashPoint.toFixed(2)}x
                  </div>
              ))}
          </div>
        </div>
      </aside>
    </main>
  );
};