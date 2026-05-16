import { Rocket, LogOut, Trophy, Wallet, Bell } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useGameStore } from "@/features/betting/store/betting.store";

interface HeaderProps {
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const Header = ({ onGoHome, onOpenLeaderboard }: HeaderProps) => {
  const { user, setAuthModalOpen, logout } = useAuth();
  const { balance} = useGameStore();
  const safeBalance = Number.isFinite(Number(balance)) ? Number(balance) : 0;

  return (
    <header className="sticky top-0 z-50 h-20 bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 lg:px-12">
      {/* Left: Logo */}
      <button onClick={onGoHome} className="flex items-center gap-3 group">
        <div className="bg-green-500 p-2 rounded-xl text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform">
          <Rocket size={22} fill="currentColor" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white italic">
          GOGO<span className="text-green-500">BET</span>
        </span>
      </button>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Live Leaderboard Icon */}
            <button onClick={onOpenLeaderboard} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-yellow-500 hover:bg-white/10 transition-all relative">
              <Trophy size={20} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </button>

            {/* Premium Balance Pill */}
            <div className="flex items-center gap-3 bg-[#1A1F29] border border-white/10 p-1 pr-4 rounded-xl shadow-xl">
              <div className="bg-yellow-500/10 p-2 rounded-lg">
                <img 
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Coin.png" 
                  className="w-5 h-5" alt="coin" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase leading-none">Balance</span>
                <span className="font-mono font-bold text-yellow-500 text-sm">
                  {safeBalance.toLocaleString()}
                </span>
              </div>
              <button className="ml-2 bg-green-500 p-1.5 rounded-lg text-black hover:bg-green-400 transition-colors">
                <Wallet size={14} fill="currentColor" />
              </button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 bg-white/5 p-1 pr-4 rounded-xl border border-white/5">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-8 h-8 rounded-lg bg-[#2A303C]" alt="avatar" />
                <span className="text-sm font-bold text-gray-200">{user.username}</span>
            </div>

            <button onClick={logout} className="p-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <button onClick={() => setAuthModalOpen(true)} className="px-8 py-3 bg-green-500 text-black font-black rounded-xl hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all uppercase text-sm">
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};