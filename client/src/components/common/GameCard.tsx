import { Play, TrendingUp } from "lucide-react";

export const GameCard = ({ title, subtitle, icon, badge, variant, onClick }: any) => {
  const themes = {
    green: {
      gradient: "from-primary/20 to-primary/5 border-primary/20 hover:border-primary/50 shadow-primary/5",
      hoverText: "group-hover:text-primary",
      hoverBtn: "group-hover:bg-primary group-hover:shadow-primary/40"
    },
    purple: {
      gradient: "from-accent/20 to-accent/5 border-accent/20 hover:border-accent/50 shadow-accent/5",
      hoverText: "group-hover:text-accent",
      hoverBtn: "group-hover:bg-accent group-hover:shadow-accent/40"
    }
  };

  const selectedTheme = themes[variant as keyof typeof themes] || themes.green;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col w-full min-h-[260px] sm:min-h-0 aspect-[16/11] rounded-[1.5rem] sm:rounded-[2rem] border bg-panel overflow-hidden transition-all duration-500 hover:-translate-y-1.5 sm:hover:-translate-y-2 bg-gradient-to-br ${selectedTheme.gradient}`}
    >
      {/* Responsive Badge */}
      {badge && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-xl px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/10">
          <TrendingUp size={10} className="text-primary animate-pulse" />
          <span className="text-[8px] sm:text-[10px] font-black uppercase text-white tracking-widest">{badge}</span>
        </div>
      )}

      {/* Main Vector Content Area */}
      <div className="flex-1 flex items-center justify-center relative z-10 transition-transform duration-700 group-hover:scale-105 sm:group-hover:scale-110 p-6">
        <div className="drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
            {icon}
        </div>
      </div>

      {/* Footer Area */}
      <div className="relative w-full z-20 p-5 sm:p-8 bg-black/50 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between gap-4">
        <div className="text-left min-w-0">
          <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-0.5 sm:mb-1 truncate">{subtitle}</p>
          <h3 className={`text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase  leading-none transition-colors truncate ${selectedTheme.hoverText}`}>
            {title}
          </h3>
        </div>
        
        {/* Play Button */}
        <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white text-black flex items-center justify-center shrink-0 transition-all shadow-xl ${selectedTheme.hoverBtn}`}>
          <Play size={18} fill="currentColor" className="translate-x-0.5 sm:translate-x-1 w-4 h-4 sm:w-6 sm:h-6" />
        </div>
      </div>
    </button>
  );
};