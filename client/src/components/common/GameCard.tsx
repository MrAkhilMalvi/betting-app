import { Play, TrendingUp } from "lucide-react";

export const GameCard = ({ title, subtitle, icon, badge, variant, onClick }: any) => {
  const themes = {
    green: "from-green-500/20 to-green-900/5 border-green-500/20 hover:border-green-500/50 shadow-green-500/5",
    purple: "from-purple-500/20 to-purple-900/5 border-purple-500/20 hover:border-purple-500/50 shadow-purple-500/5",
  };

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col w-full aspect-[16/11] rounded-[2.5rem] border bg-[#151A22] overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br ${themes[variant as keyof typeof themes]}`}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10">
          <TrendingUp size={12} className="text-green-400" />
          <span className="text-[10px] font-black uppercase text-white tracking-widest">{badge}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 transition-transform duration-700 group-hover:scale-110">
        <div className="drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]">
            {icon}
        </div>
      </div>

      {/* Professional Footer */}
      <div className="relative z-20 p-8 bg-black/40 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{subtitle}</p>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none group-hover:text-green-400 transition-colors">
            {title}
          </h3>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center group-hover:bg-green-500 transition-all shadow-xl group-hover:shadow-green-500/40">
          <Play size={24} fill="currentColor" className="translate-x-0.5" />
        </div>
      </div>
    </button>
  );
};