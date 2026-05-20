import React from "react";
import { Header } from "./components/common/Header";
import { ChevronLeft } from "lucide-react";
import { AppLayoutProps } from "./types/types";

const AppLayout: React.FC<AppLayoutProps> = ({
  view,
  onBackToLobby,
  onOpenLeaderboard,
  children,
}) => {
  const isLobby = view === "lobby";

  return (
    <div className="min-h-screen flex flex-col bg-background text-white selection:bg-primary/30">
      {/* Global Persistent Navigation Header */}
      <Header onGoHome={onBackToLobby} onOpenLeaderboard={onOpenLeaderboard} />

      {/* Main Page Layout Wrapper */}
      <main className="flex-1 flex flex-col w-full pb-12">
        {/* Contextual Back Navigation Bar */}
        {!isLobby && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 animate-fadeIn">
            <button
              onClick={onBackToLobby}
              className="group inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors duration-200 outline-none"
            >
              <div className="p-2 rounded-lg bg-surface/50 border border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-all duration-300">
                <ChevronLeft size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none">
                Exit to Lobby
              </span>
            </button>
          </div>
        )}

        {/* Child Views Container */}
        <div className="flex-1 w-full">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
