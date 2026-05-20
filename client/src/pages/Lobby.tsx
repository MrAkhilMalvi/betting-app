import { Rocket, Ticket, Sparkles, Coins, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-background text-white p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-12 sm:space-y-16">
      
      {/* GAMIFIED HERO BANNER */}
      <div className="relative rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 lg:p-16 overflow-hidden bg-panel border border-white/5 shadow-2xl">
        
        {/* Decorative theme glows using defined colors */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/10 via-accent/5 to-transparent opacity-75 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 blur-[120px] pointer-events-none" />
        <div className="absolute -top-24 right-1/4 w-80 h-80 bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-surface/80 border border-white/5 px-3.5 py-1.5 rounded-full glass-card">
              <Sparkles className="text-primary animate-pulse" size={14} />
              <span className="text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-glow-primary">
                Exclusive Welcome Offer
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] uppercase tracking-tight">
              PLAY & CLAIM YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                1,000 COINS
              </span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base lg:text-lg font-medium max-w-lg leading-relaxed">
              Start your gaming journey instantly. Play arcade originals and
              daily draws without risk. Convert points to secure top spots on
              the leaderboard.
            </p>

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 max-w-md">
              <button
                onClick={handleClaimBonus}
                disabled={bonusClaimed}
                className={`
                  flex-1 px-6 py-4 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2
                  ${
                    bonusClaimed
                      ? "bg-surface text-gray-500 cursor-not-allowed border border-white/5"
                      : "bg-primary text-background hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(74,222,128,0.3)] active:scale-95"
                  }
                `}
              >
                <Coins size={16} />
                {bonusClaimed ? "BONUS CLAIMED" : "CLAIM COINS NOW"}
              </button>

              {!user && (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-4 rounded-xl glass-card text-white hover:text-primary font-bold text-xs sm:text-sm tracking-wider uppercase neon-border-hover flex items-center justify-center gap-2"
                >
                  Join Now <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Game Image Container */}
          <div className="lg:col-span-6 relative flex justify-center items-center h-[220px] sm:h-[320px] lg:h-[400px] overflow-hidden rounded-2xl order-1 lg:order-2">
            {/* Main Image */}
            <img
              src="/game-img.png"
              alt="Rocket and Pool Games"
              className="relative z-10 w-full max-w-[280px] sm:max-w-[360px] lg:max-w-md scale-[1.2] sm:scale-[1.3] lg:scale-[1.5] h-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)] select-none pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* GAMES SELECTION SECTION */}
      <section className="space-y-6 sm:space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-2 h-5 sm:w-2.5 sm:h-6 bg-primary rounded-full" />
          <h2 className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-[0.4em]">
            Available Originals
          </h2>
          <div className="flex-1 h-[1px] bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-1 neon-border-hover">
            <GameCard
              title="Rocket Crash"
              subtitle="Multiplayer Arcade"
              variant="green"
              badge="Most Popular"
              icon={
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20">
                  <Rocket
                    size={64}
                    className="text-primary w-12 h-12 sm:w-16 sm:h-16"
                    fill="currentColor"
                  />
                </div>
              }
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                  return;
                }
                onSelectGame();
              }}
            />
          </div>

          <div className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-1 neon-border-hover">
            <GameCard
              title="Weekly Pool"
              subtitle="Luck Draw"
              variant="purple"
              badge="Big Pool"
              icon={
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-accent/10 border border-accent/20">
                  <Ticket
                    size={64}
                    className="text-accent w-12 h-12 sm:w-16 sm:h-16"
                    fill="currentColor"
                  />
                </div>
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
        </div>
      </section>
    </div>
  );
};