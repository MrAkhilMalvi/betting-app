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

      if (nextHash) {
        setNextHash(nextHash); // 🔥 NEW
      }
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

      // 🔥 store seed
      if (data.serverSeed) {
        setLastSeed(data.serverSeed);
      }

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
        {
          id: bet.id,
          userId: bet.userId,
          amount: bet.amount,
          status: "pending",
        },
        ...prev.slice(0, 49), // Keep last 50 live bets
      ]);
    });

    socket.on("bet:cashout", (data) => {
      setLiveBets((prev) =>
        prev.map((b) =>
          b.id === data.betId
            ? {
                ...b,
                status: "won",
                multiplier: data.multiplier,
                payout: data.payout,
              }
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
        color: "bg-slate-600 cursor-not-allowed text-slate-300",
      };
    if (gameState === "waiting" && !hasBet)
      return {
        text: "Place Bet",
        color:
          "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]",
      };
    if (gameState === "waiting" && hasBet)
      return {
        text: "Bet Placed. Waiting...",
        color: "bg-orange-500 cursor-not-allowed text-white opacity-80",
      };
    if (gameState === "running" && hasBet)
      return {
        text: `Cashout ₹${(betAmount * multiplier).toFixed(2)}`,
        color:
          "bg-amber-500 hover:bg-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]",
      };
    if (gameState === "running" && !hasBet)
      return {
        text: "Game Running...",
        color: "bg-slate-700 cursor-not-allowed text-slate-400",
      };
    if (gameState === "crashed")
      return {
        text: "Crashed",
        color: "bg-rose-600 cursor-not-allowed text-white",
      };
    return { text: "Wait", color: "bg-slate-700 text-slate-400" };
  };

  const btnProps = getButtonProps();
  const isDisabled =
    isLoading ||
    gameState === "crashed" ||
    (gameState === "running" && !hasBet) ||
    (hasBet && !betId && gameState === "running");

  return (
    <main className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 p-4 max-w-[1600px] mx-auto w-full bg-[#0a0f16] min-h-screen font-sans">
      {/* LEFT PANEL - LIVE BETS */}
      <aside className="bg-[#131b26] rounded-2xl border border-slate-800 flex flex-col xl:flex shadow-2xl overflow-hidden order-3 xl:order-1 h-[600px] xl:h-auto">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#182230]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-slate-200">Live Bets</h2>
          </div>
          <span className="bg-slate-800 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-400">
            {liveBets.length} Players
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <AnimatePresence>
            {liveBets.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2"
              >
                <AlertCircle className="w-8 h-8 opacity-50" />
                <p className="text-sm font-medium">Waiting for bets...</p>
              </motion.div>
            )}

            {liveBets.map((bet) => (
              <motion.div
                key={bet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={clsx(
                  "flex justify-between items-center px-3 py-2.5 rounded-lg text-sm border transition-colors",
                  bet.status === "won"
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-slate-800/50 border-slate-700/50",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                    <Users className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-slate-300 font-medium">
                    User {bet.userId}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-200 font-mono">
                    ₹{bet.amount}
                  </span>
                  <span
                    className={clsx(
                      "font-bold min-w-[50px] text-right",
                      bet.status === "won"
                        ? "text-emerald-400"
                        : "text-amber-400",
                    )}
                  >
                    {bet.status === "won"
                      ? `${bet.multiplier?.toFixed(2)}x`
                      : "LIVE"}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>

      {/* CENTER - GAME & BET CONTROLS */}
      <div className="xl:col-span-2 flex flex-col gap-6 order-1 xl:order-2">
        {/* GAME CANVAS */}
        <div
          className={clsx(
            "relative bg-[#131b26] rounded-3xl border flex-1 min-h-[450px] flex items-center justify-center shadow-2xl overflow-hidden transition-all duration-300",
            gameState === "crashed"
              ? "border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]"
              : "border-slate-800",
          )}
        >
          {/* Subtle background glow */}
          <div
            className={clsx(
              "absolute inset-0 opacity-20 transition-colors duration-500",
              gameState === "running"
                ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"
                : "",
              gameState === "crashed"
                ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500/20 via-transparent to-transparent"
                : "",
            )}
          />

          <div className="text-center z-10 flex flex-col items-center justify-center relative">
            {gameState === "waiting" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
                <h3 className="text-2xl font-bold text-slate-200 tracking-wide">
                  Preparing Round
                </h3>
                <p className="text-emerald-400 font-mono text-xl animate-pulse">
                  Starting in {timeToStart}s
                </p>
              </motion.div>
            )}

            {gameState === "running" && (
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <h1 className="text-[7rem] leading-none font-black text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] font-mono">
                  {multiplier.toFixed(2)}
                  <span className="text-4xl text-slate-400">x</span>
                </h1>
                <div className="flex items-center justify-center gap-2 mt-4 text-emerald-400">
                  <Rocket className="w-5 h-5 animate-bounce" />
                  <span className="font-semibold tracking-widest uppercase">
                    Rocket Flying
                  </span>
                </div>
              </motion.div>
            )}

            {gameState === "crashed" && (
              <motion.div
                initial={{ rotate: -5, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="text-rose-500"
              >
                <h1 className="text-[7rem] leading-none font-black drop-shadow-[0_0_25px_rgba(244,63,94,0.4)] font-mono">
                  {multiplier.toFixed(2)}
                  <span className="text-4xl">x</span>
                </h1>
                <p className="text-2xl font-bold tracking-widest uppercase mt-2">
                  Crashed
                </p>
              </motion.div>
            )}
          </div>

          <div className="absolute inset-0 z-0 opacity-60">
            <GameGraph multiplier={multiplier} gameState={gameState} />
          </div>
        </div>

        <div className="bg-[#0a0f16] border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-400 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Next Hash:</span>
            <button
              onClick={() => copy(nextHash)}
              className="text-[10px] px-2 py-0.5 bg-slate-700 rounded hover:bg-slate-600"
            >
              Copy
            </button>
          </div>
          <div className="truncate text-emerald-400">
            {nextHash || "Generating..."}
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-slate-500">Last Seed:</span>
            <button
              onClick={() => copy(lastSeed)}
              className="text-[10px] px-2 py-0.5 bg-slate-700 rounded hover:bg-slate-600"
            >
              Copy
            </button>
          </div>
          <div className="truncate text-amber-400">
            {lastSeed || "Will reveal after crash"}
          </div>
        </div>

        {/* BET CONTROLS */}
        <div className="bg-[#131b26] p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            {/* Input Section */}
            <div className="flex-1 bg-[#0a0f16] border border-slate-700 rounded-xl p-2 flex flex-col justify-between focus-within:border-emerald-500 transition-colors">
              <div className="flex items-center px-3 pt-1">
                <span className="text-slate-400 font-bold mr-2">₹</span>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={hasBet || gameState === "running"}
                  className="bg-transparent outline-none text-white w-full font-mono text-2xl font-bold h-12 disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-1.5 px-2 pb-1 mt-2">
                {[10, 50, 100, 500].map((val) => (
                  <button
                    key={val}
                    onClick={() => setBetAmount(val)}
                    disabled={hasBet || gameState === "running"}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +{val}
                  </button>
                ))}
                <button
                  onClick={() => setBetAmount((prev) => prev * 2)}
                  disabled={hasBet || gameState === "running"}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  x2
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleBetAction}
              disabled={isDisabled}
              className={clsx(
                "sm:w-[240px] h-[88px] rounded-xl font-black text-2xl uppercase tracking-wider transition-all duration-200 active:scale-95 flex flex-col items-center justify-center",
                btnProps.color,
              )}
            >
              {btnProps.text.includes("Cashout") ? (
                <>
                  <span className="text-sm font-bold opacity-80 uppercase tracking-widest">
                    Cashout
                  </span>
                  <span>{btnProps.text.split(" ")[1]}</span>
                </>
              ) : (
                btnProps.text
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - HISTORY & BALANCE */}
      <aside className="flex flex-col gap-6 order-2 xl:order-3">
        {/* Wallet Widget */}
        <div className="bg-gradient-to-br from-[#131b26] to-[#182230] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <Wallet className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-sm uppercase tracking-wider">
              Your Balance
            </h2>
          </div>
          <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
            <span className="text-slate-500 text-xl">₹</span>
            {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* History Widget */}
        <div className="bg-[#131b26] rounded-2xl border border-slate-800 flex flex-col shadow-xl flex-1 min-h-[300px]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#182230]">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-slate-200">Recent Crashes</h2>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>

          <div className="p-4 flex flex-wrap gap-2.5 items-start align-top">
            <AnimatePresence>
              {history.map((h) => {
                // Color Logic based on Multiplier
                let badgeColor = "bg-slate-700 text-slate-300"; // Default (< 2x)
                if (h.crashPoint >= 10)
                  badgeColor =
                    "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
                // Huge
                else if (h.crashPoint >= 2)
                  badgeColor =
                    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"; // Good

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={h.id}
                    className={clsx(
                      "px-3 py-1.5 rounded-md text-sm font-bold font-mono transition-all",
                      badgeColor,
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
