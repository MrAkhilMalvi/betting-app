import { Rocket, LogOut, Trophy, Wallet } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useGameStore } from "@/features/betting/store/betting.store";
import { CoinIcon } from "../ui/CoinIcon";

interface HeaderProps {
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const Header = ({ onGoHome, onOpenLeaderboard }: HeaderProps) => {
  const { user, setAuthModalOpen, logout } = useAuth();
  const { balance } = useGameStore();
  const safeBalance = Number.isFinite(Number(balance)) ? Number(balance) : 0;

  return (
    <header className="sticky top-0 z-50 h-20 bg-background/85 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-4 sm:px-6 lg:px-12">
      
      {/* Left: Responsive Brand Logo */}
      <button onClick={onGoHome} className="flex items-center gap-2 sm:gap-3 group shrink-0">
        <div className="bg-primary p-1.5 sm:p-2 rounded-xl text-background shadow-[0_0_20px_rgba(74,222,128,0.3)] group-hover:scale-110 transition-transform">
          <Rocket size={18} className="sm:w-[22px] sm:h-[22px]" fill="currentColor" />
        </div>
        <span className="text-lg sm:text-2xl font-black tracking-tighter text-white italic uppercase">
          GOGO<span className="text-primary">BET</span>
        </span>
      </button>

      {/* Right Section: Compact & Auto-Scaling */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        {user ? (
          <>
            {/* Leaderboard Icon */}
            <button 
              onClick={onOpenLeaderboard} 
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 text-yellow-500 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all relative shrink-0"
            >
              <Trophy size={18} className="sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
              </span>
            </button>

            {/* Premium Wallet Pill */}
            <div 
              id="header-wallet-pill" 
              className="flex items-center gap-1.5 sm:gap-3 bg-panel border border-white/10 p-1 pr-2 sm:pr-4 rounded-xl shadow-xl transition-all duration-300 shrink-0"
            >
              <div className=" p-1 sm:p-1 rounded-lg">
                <CoinIcon />
              </div>
              <div className="flex flex-col text-left">
                <span className="hidden sm:block text-[9px] text-gray-500 font-bold uppercase leading-none mb-0.5">Balance</span>
                <span className="font-mono font-black text-yellow-500 text-xs sm:text-sm leading-none">
                  {safeBalance.toLocaleString()}
                </span>
              </div>
              <button className="hidden md:flex ml-1 bg-primary p-1.5 rounded-lg text-background hover:bg-green-400 transition-colors">
                <Wallet size={12} fill="currentColor" />
              </button>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-2 bg-white/5 p-1 pr-1 sm:pr-4 rounded-xl border border-white/5 shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2A303C]" 
                  alt="avatar" 
                />
                <span className="hidden sm:inline text-xs sm:text-sm font-black text-gray-200 truncate max-w-[100px]">
                  {user.username}
                </span>
            </div>

            {/* Logout Trigger */}
            <button 
              onClick={logout} 
              className="p-2 sm:p-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all shrink-0"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          </>
        ) : (
          <button 
            onClick={() => setAuthModalOpen(true)} 
            className="px-5 sm:px-8 py-2.5 sm:py-3 bg-primary text-background font-black rounded-xl hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] active:scale-95 transition-all uppercase text-xs sm:text-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};