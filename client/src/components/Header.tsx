
import { Rocket, Wallet, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onGoHome: () => void;
}

export const Header = ({ onGoHome }: HeaderProps) => {
  const { user, balance, setAuthModalOpen, logout } = useAuth();
  const safeBalance = isNaN(Number(balance)) ? 0 : Number(balance);

  return (
    <header className="sticky top-0 z-40 h-20 bg-[#151A22]/90 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 lg:px-10">
      
      {/* Logo */}
      <button 
        onClick={onGoHome} 
        className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
      >
        <div className="bg-green-500/10 p-2 rounded-lg text-green-400 group-hover:bg-green-500 group-hover:text-gray-900 transition-colors">
          <Rocket size={24} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
        </div>
        <span className="text-xl font-black tracking-tight text-white">
          ROCKET<span className="text-green-400">.bet</span>
        </span>
      </button>

      {/* Auth / Profile Section */}
      {user ? (
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Wallet Balance */}
          <div className="flex items-center gap-3 bg-[#0B0E14] border border-white/5 px-4 py-2 rounded-xl shadow-inner">
            <Wallet size={18} className="text-green-400" />
            <span className="font-mono font-bold text-white tracking-wide">
              ${safeBalance.toFixed(2)}
            </span>
          </div>

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
            <img
              src={user.avatar || "https://i.pravatar.cc/150"}
              alt="User Avatar"
              className="w-10 h-10 rounded-xl object-cover border border-white/10"
            />
            <span className="font-medium text-gray-200">{user.username}</span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={logout}
            title="Logout"
            className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-2.5 rounded-xl transition-colors"
          >
            <LogOut size={20} />
          </button>

        </div>
      ) : (
        <button 
          onClick={() => setAuthModalOpen(true)}
          className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-gray-900 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
        >
          Sign In
        </button>
      )}
    </header>
  );
};