import React, { useState, useEffect } from "react";
import {
  Coins,
  History,
  Users,
  Wallet,
  TrendingUp,
  AlertCircle,
  Loader2,
  Rocket,
  Copy,
  ShieldCheck,
  Zap
} from "lucide-react";
import { socket } from "../../api/socket/game.socket";
import { GameGraph } from "../GameGraph";
import { useAuth } from "../../context/AuthContext";
import { clsx } from "clsx";
import { placeBetApi, resolveBetApi } from "../../api/Bet.api";
import { motion, AnimatePresence } from "framer-motion";
import { copy } from "../../lib/copySeed";
import toast from "react-hot-toast";

type GameState = "waiting" | "running" | "crashed";

export const RocketGame: React.FC = () => {
  const { balance, refreshWallet } = useAuth();

  const [multiplier, setMultiplier] = useState(1);
  const [gameState, setGameState] = useState<GameState>("waiting");

  const [betAmount, setBetAmount] = useState<number>(10);
  const [liveBets, setLiveBets] = useState<any[]>([]);
  const [hasBet, setHasBet] = useState(false);
  const [betId, setBetId] = useState<number | null>(null);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [nextHash, setNextHash] = useState<string | null>(null);
  const [lastSeed, setLastSeed] = useState<string | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [timeToStart, setTimeToStart] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.on("game:waiting", ({ remaining, nextHash }) => {
      setGameState("waiting");
      setTimeToStart(remaining);
      setMultiplier(1);
      if (nextHash) setNextHash(nextHash);
    });

    socket.on("game:start", ({ roundId }) => {
      setGameState("running");
      setRoundId(roundId);
    });

    socket.on("game:update", (data) => {
      setMultiplier(data.multiplier);
    });

    socket.on("game:crash", (data) => {
      setMultiplier(data.multiplier);
      setGameState("crashed");
      setIsLoading(true);

      if (data.serverSeed) setLastSeed(data.serverSeed);

      setHistory((prev) => [
        { id: Date.now(), crashPoint: data.multiplier },
        ...prev.slice(0, 19),
      ]);

      setHasBet(false);
      setBetId(null);
      setLiveBets([]);

      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    });

    socket.on("bet:new", (bet) => {
      setLiveBets((prev) => [
        { id: bet.id, userId: bet.userId, amount: bet.amount, status: "pending" },
        ...prev.slice(0, 49),
      ]);
    });

    socket.on("bet:cashout", (data) => {
      setLiveBets((prev) =>
        prev.map((b) =>
          b.id === data.betId
            ? { ...b, status: "won", multiplier: data.multiplier, payout: data.payout }
            : b,
        ),
      );
    });

    return () => {
      socket.off("game:waiting");
      socket.off("game:start");
      socket.off("game:update");
      socket.off("game:crash");
      socket.off("bet:new");
      socket.off("bet:cashout");
    };
  }, []);

  const handleBetAction = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);

      if (gameState === "waiting" && !hasBet) {
        if (balance < betAmount) {
          toast.error("Insufficient balance");
          return;
        }
        const res = await placeBetApi(betAmount);
        const id = res.data?.bet?.id;
        if (!id) throw new Error("Invalid bet response");

        setBetId(id);
        setHasBet(true);
        await refreshWallet();
      } else if (gameState === "running" && hasBet && betId && multiplier > 1) {
        if (!roundId) {
          toast.error("Round sync error");
          return;
        }
        await resolveBetApi(betId, multiplier);
        setHasBet(false);
        setBetId(null);
        await refreshWallet();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg === "INVALID_ROUND") {
        toast("💥 Too late! You missed the crash");
      } else if (msg === "BET_CLOSED") {
        toast("Betting closed");
      } else {
        toast.error(msg || "Action failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonProps = () => {
    if (isLoading)
      return {
        text: "Processing...",
        color: "bg-[#1E293B] text-slate-400 cursor-not-allowed border-slate-700",
      };
    if (gameState === "waiting" && !hasBet)
      return {
        text: "Place Bet",
        color: "bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-gray-900 shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-400",
      };
    if (gameState === "waiting" && hasBet)
      return {
        text: "Bet Placed...",
        color: "bg-gradient-to-b from-orange-400 to-orange-600 cursor-not-allowed text-white opacity-90 border-orange-400 shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)]",
      };
    if (gameState === "running" && hasBet)
      return {
        text: `Cashout ₹${(betAmount * multiplier).toFixed(2)}`,
        color: "bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-gray-900 shadow-[0_0_30px_rgba(245,158,11,0.5)] border-amber-300 animate-pulse",
      };
    if (gameState === "running" && !hasBet)
      return {
        text: "Game Running",
        color: "bg-[#1A202A] cursor-not-allowed text-slate-500 border-slate-800",
      };
    if (gameState === "crashed")
      return {
        text: "Crashed",
        color: "bg-gradient-to-b from-rose-500 to-rose-700 cursor-not-allowed text-white border-rose-500",
      };
    return { text: "Wait", color: "bg-[#1A202A] text-slate-500 border-slate-800" };
  };

  const btnProps = getButtonProps();
  const isDisabled =
    isLoading ||
    gameState === "crashed" ||
    (gameState === "running" && !hasBet) ||
    (hasBet && !betId && gameState === "running");

  return (
    <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto w-full min-h-[calc(100vh-80px)] font-sans">
      
      {/* ================= LEFT PANEL: LIVE BETS ================= */}
      <aside className="lg:col-span-3 bg-[#151A22] rounded-2xl border border-white/5 flex flex-col shadow-2xl overflow-hidden order-3 lg:order-1 h-[500px] lg:h-auto">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#11151c]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-gray-200">Live Bets</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0B0E14] px-3 py-1 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-gray-400">{liveBets.length} Playing</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <AnimatePresence>
            {liveBets.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3"
              >
                <div className="p-4 bg-white/5 rounded-full">
                  <AlertCircle className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm font-medium">Waiting for players...</p>
              </motion.div>
            )}

            {liveBets.map((bet) => (
              <motion.div
                key={bet.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={clsx(
                  "flex justify-between items-center px-3 py-2.5 rounded-xl text-sm transition-colors border",
                  bet.status === "won"
                    ? "bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]"
                    : "bg-[#0B0E14] border-white/5",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <img 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=User${bet.userId}&backgroundColor=1e293b`}
                    alt="avatar" 
                    className="w-7 h-7 rounded-full border border-white/10" 
                  />
                  <span className="text-gray-300 font-medium text-xs">
                    User {bet.userId}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-mono text-xs">
                    ₹{bet.amount}
                  </span>
                  <span
                    className={clsx(
                      "font-black min-w-[50px] text-right text-sm",
                      bet.status === "won" ? "text-emerald-400" : "text-amber-400 animate-pulse",
                    )}
                  >
                    {bet.status === "won" ? `${bet.multiplier?.toFixed(2)}x` : "LIVE"}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>

      {/* ================= CENTER: GAME & CONTROLS ================= */}
      <div className="lg:col-span-6 flex flex-col gap-4 order-1 lg:order-2">
        
        {/* GAME CANVAS */}
        <div className="relative bg-[#151A22] rounded-3xl border border-white/5 flex-1 min-h-[400px] lg:min-h-[480px] flex items-center justify-center shadow-2xl overflow-hidden p-1">
          <div className="absolute inset-0 z-0 opacity-80">
            <GameGraph multiplier={multiplier} gameState={gameState} />
          </div>

          <div className="text-center z-10 flex flex-col items-center justify-center relative pointer-events-none">
            {gameState === "waiting" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4 bg-[#0B0E14]/80 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/10 shadow-2xl"
              >
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                <h3 className="text-2xl font-black text-white tracking-wide font-display">
                  Preparing Round
                </h3>
                <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
                  <p className="text-emerald-400 font-mono text-lg font-bold">
                    Starting in {timeToStart}s
                  </p>
                </div>
              </motion.div>
            )}

            {gameState === "running" && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h1 className="text-[6rem] lg:text-[8rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] font-mono tracking-tighter">
                  {multiplier.toFixed(2)}
                  <span className="text-3xl lg:text-5xl text-gray-500 ml-1">x</span>
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2 text-emerald-400">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span className="font-bold tracking-widest uppercase text-sm">Target Climbing</span>
                </div>
              </motion.div>
            )}

            {gameState === "crashed" && (
              <motion.div
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-rose-500"
              >
                <h1 className="text-[6rem] lg:text-[8rem] leading-none font-black drop-shadow-[0_0_40px_rgba(244,63,94,0.6)] font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-rose-400 to-rose-600">
                  {multiplier.toFixed(2)}
                  <span className="text-3xl lg:text-5xl ml-1 text-rose-700">x</span>
                </h1>
                <div className="inline-block bg-rose-500/10 border border-rose-500/20 px-6 py-2 rounded-full mt-4">
                  <p className="text-xl font-black tracking-widest uppercase text-rose-500">
                    Crashed
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* PROVABLY FAIR INFO BAR */}
        <div className="bg-[#151A22] border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center gap-2 p-2 px-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 whitespace-nowrap mr-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Fair Play</span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
          
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Hash:</span>
              <span className="text-xs font-mono text-emerald-400/80 truncate max-w-[120px] sm:max-w-[200px]">
                {nextHash || "Generating..."}
              </span>
              {nextHash && (
                <button onClick={() => { copy(nextHash); toast.success("Hash Copied"); }} className="p-1 hover:bg-white/10 rounded-md text-gray-500 transition-colors">
                  <Copy size={12} />
                </button>
              )}
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Seed:</span>
              <span className="text-xs font-mono text-amber-400/80 truncate max-w-[120px] sm:max-w-[150px]">
                {lastSeed || "Hidden during round"}
              </span>
              {lastSeed && (
                <button onClick={() => { copy(lastSeed); toast.success("Seed Copied"); }} className="p-1 hover:bg-white/10 rounded-md text-gray-500 transition-colors">
                  <Copy size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BET CONTROLS */}
        <div className="bg-[#151A22] p-4 lg:p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-emerald-500/5 blur-[50px] pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-stretch gap-4 relative z-10">
            {/* Input Wrapper */}
            <div className="flex-1 bg-[#0B0E14] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between focus-within:border-emerald-500/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
              <div className="flex items-center px-4 pt-2">
                <Coins className="w-5 h-5 text-yellow-400 mr-3" />
                <span className="text-gray-500 font-bold text-xl mr-1">₹</span>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={hasBet || gameState === "running"}
                  className="bg-transparent outline-none text-white w-full font-mono text-3xl font-black h-12 disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-5 gap-2 px-2 pb-1 mt-3">
                {[10, 50, 100, 500].map((val) => (
                  <button
                    key={val}
                    onClick={() => setBetAmount(val)}
                    disabled={hasBet || gameState === "running"}
                    className="py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 hover:border-white/10"
                  >
                    +{val}
                  </button>
                ))}
                <button
                  onClick={() => setBetAmount((prev) => prev * 2)}
                  disabled={hasBet || gameState === "running"}
                  className="py-2 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-xl text-xs font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 hover:border-emerald-500/30"
                >
                  x2
                </button>
              </div>
            </div>

            {/* Huge Action Button */}
            <button
              onClick={handleBetAction}
              disabled={isDisabled}
              className={clsx(
                "sm:w-[260px] h-[100px] rounded-2xl font-black text-2xl uppercase tracking-wider transition-all duration-200 active:scale-[0.98] flex flex-col items-center justify-center border-b-4",
                btnProps.color,
              )}
            >
              {btnProps.text.includes("Cashout") ? (
                <>
                  <span className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">
                    Cashout
                  </span>
                  <span className="drop-shadow-md text-3xl">{btnProps.text.split(" ")[1]}</span>
                </>
              ) : (
                <span className="drop-shadow-md">{btnProps.text}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL: HISTORY & STATS ================= */}
      <aside className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-3">
        
        {/* Account Balance Summary */}
        <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1f2937] via-[#151A22] to-[#151A22] rounded-2xl border border-white/5 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-xs uppercase tracking-widest">Available Balance</h2>
            </div>
          </div>
          <div className="text-4xl font-black text-white font-mono flex items-baseline gap-2">
            <span className="text-emerald-500 text-2xl">₹</span>
            {balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Recent Crashes / History */}
        <div className="bg-[#151A22] rounded-2xl border border-white/5 flex flex-col shadow-xl flex-1 min-h-[300px]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#11151c]">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-gray-200">Recent History</h2>
            </div>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </div>

          <div className="p-4 flex flex-wrap gap-2 items-start align-top content-start">
            <AnimatePresence>
              {history.map((h) => {
                // Tier logic for coloring history pills
                let badgeClass = "bg-[#1E293B] text-gray-400 border-white/5"; // < 2x
                if (h.crashPoint >= 10)
                  badgeClass = "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]"; 
                else if (h.crashPoint >= 2)
                  badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"; 

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    key={h.id}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-sm font-black font-mono transition-all border",
                      badgeClass,
                    )}
                  >
                    {h.crashPoint.toFixed(2)}x
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </aside>

    </main>
  );
};