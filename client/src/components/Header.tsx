import { Rocket, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onGoHome: () => void;
}

export const Header = ({ onGoHome }: HeaderProps) => {
  const { user, balance, loading, setAuthModalOpen, logout } = useAuth();

  // ✅ Bulletproof balance calculation
  const safeBalance = Number.isFinite(Number(balance)) ? Number(balance) : 0;

  return (
    <header className="sticky top-0 z-40 h-20 bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-4 sm:px-6 lg:px-10">
      {/* Left: Logo */}
      <button
        onClick={onGoHome}
        className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
      >
        <div className="bg-green-500/10 p-2 rounded-xl text-green-400 group-hover:bg-green-500 group-hover:text-gray-900 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.1)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          <Rocket
            size={22}
            className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300"
          />
        </div>
        <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
          ROCKET<span className="text-green-400">.bet</span>
        </span>
      </button>

      {/* Right Section */}
      {loading ? (
        <div className="flex space-x-2 animate-pulse">
          <div className="w-24 h-10 bg-white/5 rounded-full"></div>
          <div className="w-10 h-10 bg-white/5 rounded-full"></div>
        </div>
      ) : user ? (
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Modern 3D Coin Balance Pill */}
          <div className="flex items-center gap-2 bg-[#151A22] border border-white/5 hover:border-white/10 transition-colors px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-inner group cursor-default">
            {/* 3D Coin Image - Replace src with your own local path like '/coin.png' if needed */}
            <img 
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Coin.png" 
              alt="3D Coin" 
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_8px_rgba(250,204,21,0.4)] group-hover:scale-110 transition-transform duration-300"
            />
            <span className="font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-500 tracking-wide text-sm sm:text-base drop-shadow-sm">
              {safeBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* User Profile Pill */}
          <div className="hidden sm:flex items-center gap-3 bg-[#151A22] border border-white/5 pl-2 pr-4 py-1.5 rounded-full">
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=22c55e`
              }
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm"
            />
            <span className="font-semibold text-sm text-gray-200 tracking-wide">
              {user.username}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Logout"
            className="text-gray-400 bg-[#151A22] border border-white/5 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 p-2.5 rounded-full transition-all duration-300"
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-6 py-2.5 bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-gray-900 font-extrabold rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transform hover:-translate-y-0.5"
        >
          Sign In
        </button>
      )}
    </header>
  );
};