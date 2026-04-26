// src/components/RocketGame/index.tsx
import React, { useState, useEffect } from "react";
import { Coins, History, Users } from "lucide-react";
import { useMockGame } from "../../hooks/useMockGame";
import { GameGraph } from "../GameGraph";
import { useAuth } from "../../context/AuthContext";
import { clsx } from "clsx";

export const RocketGame: React.FC = () => {
  const { gameState, multiplier, timeToStart, history, players } =
    useMockGame();
  const { balance, updateBalance } = useAuth();

  const [betAmount, setBetAmount] = useState(10);
  const [hasBet, setHasBet] = useState(false);

  const handleBetAction = () => {
    if (gameState === "waiting" && !hasBet) {
      if (balance >= betAmount) {
        updateBalance(-betAmount);
        setHasBet(true);
      }
    } else if (gameState === "running" && hasBet) {
      const winnings = betAmount * multiplier;
      updateBalance(winnings);
      setHasBet(false);
    }
  };

  useEffect(() => {
    if (gameState === "crashed") setHasBet(false);
  }, [gameState]);

  // Return exactly the <main className="flex-1 grid grid-cols-1 lg:grid-cols-4..."> block
  // from the previous response here.
  return (
    <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 max-w-[1800px] mx-auto w-full">
      {/* LEFT SIDEBAR: Live Bets */}
      <aside className="bg-panel rounded-2xl border border-surface flex flex-col hidden lg:flex shadow-xl overflow-hidden">
        <div className="p-4 border-b border-surface flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-gray-200">Live Bets</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {players.map((p) => (
            <div
              key={p.id}
              className={clsx(
                "flex justify-between items-center p-2 rounded-lg text-sm transition-colors",
                p.cashedOut
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-surface",
              )}
            >
              <span className="text-gray-400">{p.username}</span>
              <div className="flex gap-3 text-right">
                <span className="text-gray-200">💎 {p.betAmount}</span>
                {p.cashedOut && p.multiplier && (
                  <span className="text-primary font-mono drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                    {p.multiplier.toFixed(2)}x
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER TIER: Game Area & Controls */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* GAME CANVAS AREA */}
        <div
          className={clsx(
            "relative bg-panel rounded-2xl border flex-1 min-h-[350px] lg:min-h-[500px] flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-300",
            gameState === "crashed"
              ? "border-danger bg-danger/5"
              : "border-surface",
          )}
        >
          {/* Screen Shake Wrapper on Crash */}
          <div
            className={clsx(
              "absolute inset-0 flex flex-col items-center justify-center z-10",
              gameState === "crashed" && "animate-shake",
            )}
          >
            {gameState === "waiting" && (
              <div className="text-center animate-pulseGlow">
                <p className="text-gray-400 mb-2 uppercase tracking-[0.2em] text-sm">
                  Preparing Next Round
                </p>
                <p className="text-6xl font-mono font-black text-white">
                  {timeToStart.toFixed(1)}s
                </p>
              </div>
            )}

            {gameState === "running" && (
              <div className="text-center transition-transform scale-110">
                <p className="text-gray-400 mb-2 uppercase tracking-[0.2em] text-sm">
                  Current Payout
                </p>
                <p className="text-7xl md:text-9xl font-black font-mono text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] tracking-tighter">
                  {multiplier.toFixed(2)}x
                </p>
              </div>
            )}

            {gameState === "crashed" && (
              <div className="text-center">
                <p className="text-danger mb-2 uppercase tracking-[0.2em] text-sm font-bold">
                  Crashed
                </p>
                <p className="text-7xl md:text-9xl font-black font-mono text-danger drop-shadow-[0_0_40px_rgba(239,68,68,0.8)] tracking-tighter">
                  {multiplier.toFixed(2)}x
                </p>
              </div>
            )}
          </div>

          {/* SVG Background Animation */}
          <GameGraph multiplier={multiplier} gameState={gameState} />
        </div>

        {/* BETTING CONTROLS */}
        <div className="bg-panel p-6 rounded-2xl border border-surface shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto items-end">
            <div className="flex-1 w-full">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                Bet Amount
              </label>
              <div className="relative flex items-center bg-background rounded-xl border border-surface focus-within:border-primary/50 transition-colors">
                <Coins className="absolute left-3 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={gameState === "running" || hasBet}
                  className="w-full bg-transparent text-white font-mono text-lg py-3 pl-10 pr-20 outline-none disabled:opacity-50"
                />
                <div className="absolute right-2 flex gap-1">
                  <button className="px-2 py-1 bg-surface rounded hover:bg-gray-700 text-xs font-bold transition">
                    1/2
                  </button>
                  <button className="px-2 py-1 bg-surface rounded hover:bg-gray-700 text-xs font-bold transition">
                    2x
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleBetAction}
              disabled={
                gameState === "crashed" || (gameState === "waiting" && hasBet)
              }
              className={clsx(
                "w-full md:w-48 py-4 rounded-xl font-bold uppercase tracking-widest text-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
                gameState === "waiting" &&
                  !hasBet &&
                  "bg-primary text-background hover:bg-green-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]",
                gameState === "waiting" &&
                  hasBet &&
                  "bg-gray-700 text-gray-400",
                gameState === "running" &&
                  hasBet &&
                  "bg-orange-500 text-white hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]",
                gameState === "running" &&
                  !hasBet &&
                  "bg-surface text-gray-500",
              )}
            >
              {gameState === "waiting" && !hasBet && "Place Bet"}
              {gameState === "waiting" && hasBet && "Bet Placed"}
              {gameState === "running" &&
                hasBet &&
                `Cashout ${(betAmount * multiplier).toFixed(2)}`}
              {gameState === "running" && !hasBet && "Wait..."}
              {gameState === "crashed" && "Crashed"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: History */}
      <aside className="bg-panel rounded-2xl border border-surface flex flex-col shadow-xl overflow-hidden">
        <div className="p-4 border-b border-surface flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-gray-200">Recent Crashes</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-wrap gap-2">
            {history.map((h, idx) => (
              <div
                key={h.id}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-sm font-mono font-bold shadow-sm transition-all",
                  h.crashPoint >= 2.0
                    ? "bg-primary/10 text-primary border border-primary/20 drop-shadow-[0_0_2px_rgba(74,222,128,0.5)]"
                    : "bg-surface text-gray-400 border border-gray-800",
                  idx === 0 && "animate-pulse", // Highlight latest
                )}
              >
                {h.crashPoint.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
};
