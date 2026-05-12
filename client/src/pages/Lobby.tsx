import React from "react";
import { Rocket, Play, Sparkles } from "lucide-react";

interface Props {
  onSelectGame: () => void;
  onOpenPool: () => void;
}

export const Lobby: React.FC<Props> = ({ onSelectGame, onOpenPool }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Hero / Promo Section */}
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        <section className="relative h-64 rounded-3xl overflow-hidden border border-white/5 bg-panel">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-10" />
          <div className="relative z-20 p-10 flex flex-col justify-center h-full">
            <span className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest mb-2 uppercase">
              <Sparkles size={14} /> Special Offer
            </span>
            <h2 className="text-4xl font-black text-white mb-4">
              PURCHASE OFFER:
              <br />
              GET 200% BONUS
            </h2>
            <button className="bg-primary text-background font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform w-fit">
              CLAIM NOW
            </button>
          </div>
        </section>

        {/* Section Header */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_#4ADE80]" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Popular Games
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Game Card - Rocket Crash */}
            <GameCard
              title="Rocket Crash"
              subtitle="Originals"
              icon={<Rocket className="w-12 h-12" />}
              color="text-primary"
              onClick={onSelectGame}
            />

            {/* Game Card - Weekly Pool */}
            <GameCard
              title="Weekly Pool"
              subtitle="Lucky Draw"
              icon={<span className="text-4xl">🎟</span>}
              color="text-accent"
              onClick={onOpenPool}
              isPool
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const GameCard = ({
  title,
  subtitle,
  icon,
  color,
  onClick,
  isPool = false,
}: any) => (
  <div
    onClick={onClick}
    className="group relative bg-panel rounded-2xl border border-white/5 overflow-hidden cursor-pointer neon-border-hover"
  >
    <div className="h-40 bg-surface flex items-center justify-center relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className={`absolute inset-0 opacity-10 bg-gradient-to-br ${isPool ? "from-purple-500" : "from-primary"}`}
      />
      <div
        className={`${color} group-hover:scale-110 transition-transform duration-500 z-10`}
      >
        {icon}
      </div>
    </div>

    <div className="p-5 flex justify-between items-center bg-panel">
      <div>
        <h3 className="font-bold text-white group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          {subtitle}
        </p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center group-hover:bg-primary transition-all">
        <Play
          size={16}
          className="text-gray-400 group-hover:text-background ml-1"
          fill="currentColor"
        />
      </div>
    </div>
  </div>
);
