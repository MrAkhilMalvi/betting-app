import { Rocket, Ticket, Sparkles } from "lucide-react";
import { GameCard } from "../components/common/GameCard";
import { useGameStore } from "@/features/betting/store/betting.store";
import { claimWelcomeBonus } from "@/features/auth/services/AuthService";
import toast from "react-hot-toast";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  spawnCoins,
  triggerConfetti,
} from "@/components/common/TriggerConfetti";

export const Lobby = ({ onSelectGame, onOpenPool }: any) => {
  const { bonusClaimed, setBonusClaimed, setBalance } = useGameStore();
  const { user, setAuthModalOpen } = useAuth();

  const handleClaimBonus = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const data = await claimWelcomeBonus();

      triggerConfetti();
      spawnCoins(e.clientX, e.clientY);

      setBalance(data.balance);
      setBonusClaimed(true);
      toast.success("1,000 Coins claimed!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-12">
      {/* PROFESSIONAL WELCOME BANNER */}
      <div className="relative rounded-[2.5rem] p-10 sm:p-16 overflow-hidden bg-[#151A22] border border-white/5 group shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-green-500/10 to-transparent opacity-60" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-500/10 blur-[120px]" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-green-500" size={20} />
            <span className="text-green-500 text-xs font-black uppercase tracking-[0.3em]">
              New Player Exclusive
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white leading-[0.9] mb-6 italic uppercase tracking-tighter">
            CLAIM YOUR <br />
            <span className="text-green-500">1,000 COINS</span>
          </h1>

          <p className="text-gray-400 text-lg font-medium mb-8 max-w-md">
            Start playing our exclusive originals today. No deposit required for
            your first 1,000 coins.
          </p>

          <button
            onClick={handleClaimBonus}
            disabled={bonusClaimed}
            className={`
              px-10 py-5 rounded-2xl
              font-black uppercase italic
              tracking-tight text-lg transition-all
              ${
                bonusClaimed
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]"
              }
            `}
          >
            {bonusClaimed ? "BONUS CLAIMED" : "GET FREE COINS NOW"}
          </button>
        </div>

        {/* 3D Coin Image decoration */}
        <img
          src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Coin.png"
          className="absolute hidden lg:block bottom-10 right-20 w-64 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:translate-y-[-10px] transition-transform duration-1000"
          alt="coins"
        />
      </div>

      {/* EXCLUSIVE GAMES SECTION */}
      <section>
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em]">
            Available Games
          </h2>
          <div className="flex-1 h-[1px] bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GameCard
            title="Rocket Crash"
            subtitle="Multiplayer Original"
            variant="green"
            badge="Most Popular"
            icon={
              <Rocket
                size={100}
                className="text-green-500"
                fill="currentColor"
              />
            }
            onClick={() => {
              if (!user) {
                setAuthModalOpen(true);
                return;
              }
              onSelectGame();
            }}
          />
          <GameCard
            title="Weekly Pool"
            subtitle="Community Luck Draw"
            variant="purple"
            badge="Big Wins"
            icon={
              <Ticket
                size={100}
                className="text-purple-500"
                fill="currentColor"
              />
            }
            onClick={() => {
              if (!user) {
                setAuthModalOpen(true);
                return;
              }
              onOpenPool();
            }}
          />
        </div>
      </section>
    </div>
  );
};
