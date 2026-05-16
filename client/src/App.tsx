import React, { useState } from "react";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { Header } from "./components/common/Header";
import { AuthModal } from "./features/auth/components/AuthModal";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { RocketGame } from "./features/betting/pages/index";
import { Lobby } from "./pages/Lobby"; // ✅ ADD THIS
import { PoolPage } from "./features/pool/pages/PoolPage";
import { Leaderboard } from "./features/leaderboard/components/Leaderboard";

import { ChevronLeft } from "lucide-react";

export default function App() {
  const [view, setView] = useState<"lobby" | "game" | "pool" | "leaderboard">("lobby");

  // Helper to handle "Exit" logic
  const handleBackToLobby = () => setView("lobby");

  return (
    <AuthProvider>
      <Header 
        onGoHome={handleBackToLobby}
        onOpenLeaderboard={() => setView('leaderboard')}  
      />

      <main className="flex-1 bg-[#0B0E14] min-h-[calc(100vh-80px)]">
        {/* Render "Back" button automatically for any view that isn't the lobby */}
        {view !== "lobby" && (
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <button 
              onClick={handleBackToLobby}
              className="group flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10">
                <ChevronLeft size={16} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Exit to Lobby</span>
            </button>
          </div>
        )}

        {/* Dynamic Views */}
        {view === "lobby" && (
          <Lobby
            onSelectGame={() => setView("game")}
            onOpenPool={() => setView("pool")}
            onOpenLeaderboard={() => setView("leaderboard")}
          />
        )}

        {view === "game" && (
          <ProtectedRoute>
            <RocketGame />
          </ProtectedRoute>
        )}

        {view === "pool" && (
          <ProtectedRoute>
            <PoolPage />
          </ProtectedRoute>
        )}

        {view === "leaderboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Leaderboard />
          </div>
        )}
        
      </main>

      <AuthModal />
    </AuthProvider>
  );
}